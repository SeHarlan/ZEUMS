import NextAuth, { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import { getCsrfToken } from "next-auth/react";
import { SignInMessage } from "../../../utils/auth";
import connectToDatabase, { getMongoClient } from "@/server/db/mongodb";
import { findOrCreateUser } from "@/server/services/user";
import { ChainIdsEnum } from "@/types/wallet";
import { NextRequest, NextResponse } from "next/server";
import { handleServerError } from "@/utils/handleError";
import GoogleProvider from "next-auth/providers/google";
import { sendMagicLinkEmail } from "@/server/services/email";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import { TITLE_COPY } from "@/textCopy/mainCopy";
// import TwitterProvider from "next-auth/providers/twitter";
// import AppleProvider from "next-auth/providers/apple";
// import GitHubProvider from "next-auth/providers/github";

const getProviders = () => {
  const appName = TITLE_COPY;
  const fromEmail =
    process.env.NODE_ENV === "development"
      ? "noreply@resend.dev"
      : "noreply@" + process.env.EMAIL_DOMAIN;

  const from = `${appName} <${fromEmail}>`;

  return [
    EmailProvider({
      from,
      async sendVerificationRequest({ identifier: email, url }) {
        await sendMagicLinkEmail({
          to: email,
          magicLink: url,
          from,
          appName,
        });
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
      // Ensure proper callback URL handling
      checks: ["state"],
    }),
    // TwitterProvider({
    //   clientId: process.env.TWITTER_CLIENT_ID || "",
    //   clientSecret: process.env.TWITTER_CLIENT_SECRET || "",
    // }),
    // AppleProvider({
    //   clientId: process.env.APPLE_CLIENT_ID || "",
    //   clientSecret: process.env.APPLE_CLIENT_SECRET || "",
    // }),
    // GitHubProvider({
    //   clientId: process.env.GITHUB_CLIENT_ID || "",
    //   clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    // }),
    CredentialsProvider({
      name: "Solana",
      credentials: {
        message: {
          label: "Message",
          type: "text",
        },
        signature: {
          label: "Signature",
          type: "text",
        },
      },
      async authorize(credentials, req) {
        try {
          const authUrl = process.env.NEXTAUTH_URL;

          if (!authUrl) {
            return null;
          }

          const signinMessage = new SignInMessage(
            JSON.parse(credentials?.message || "{}")
          );
          const nextAuthUrl = new URL(authUrl);
          if (signinMessage.domain !== nextAuthUrl.host) {
            return null;
          }

          const csrfToken = await getCsrfToken({ req: { ...req, body: null } });

          if (signinMessage.nonce !== csrfToken) {
            return null;
          }

          const validationResult = await signinMessage.validate(
            credentials?.signature || ""
          );

          if (!validationResult)
            throw new Error("Could not validate the signed message");

          const sessionUser = await findOrCreateUser({
            wallet: {
              type: ChainIdsEnum.SOLANA,
              address: signinMessage.publicKey,
            },
            createData: {
              username: signinMessage.publicKey,
            },
          });

          if (!sessionUser) return null;
          console.log("🚀 ~ authorize ~ sessionUser:", sessionUser)

          return sessionUser;
        } catch (e) {
          handleServerError({
            error: e,
            location: "handlers-nextAuthOptions",
          });
          return null;
        }
      },
    }),
  ];
}



// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getAuthOptions = (req: NextRequest): NextAuthOptions => {
  const config: NextAuthOptions = {
    adapter: MongoDBAdapter(getMongoClient()),
    providers: getProviders(),
    session: {
      strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
      signIn: "/api/auth/signin",
      error: "/api/auth/error",
      verifyRequest: "/api/auth/verify-request",
    },
    debug: process.env.NODE_ENV === "development",
    callbacks: {
      async signIn({ user, account }) {
        // Handle user creation/updates after successful OAuth authentication
        //"credential" sign in is handled in the custom authorize callback
        if (account && account.provider !== "credentials") {
          try {
            const email = user.email;

            if (!email) {
              throw new Error("Email not found in user");
            }

            const username =
              user.name?.replaceAll(" ", "") || email.split("@")[0];

            const sessionUser = await findOrCreateUser({
              account,
              createData: {
                username,
                email,
              },
            });

            if (!sessionUser) {
              throw new Error("Error creating user in provider authorization step");
            }
            user = sessionUser;
          } catch (error) {
            handleServerError({
              error,
              location: `handlers-nextAuthOptions_signIn_${account.provider}`,
            });
            return false; // Prevent sign in if user creation fails
          }
        }
        return true;
      },
      async jwt({ token, user }) {
        if (user) {
          token.user = user
        }
        return token;
      },
      async session({ session, token }) {
        if (isAuthUser(token.user)) {
          session.user = token.user;
        }
        return session;
      },
    },
  };

  return config;
};


// Type guard to check if token.user exists and has the expected User shape
const isAuthUser = (user: unknown): user is User => {
  return (
    user !== null &&
    typeof user === 'object' &&
    'id' in user &&
    typeof user.id === 'string'
  );
};


export async function authHandler(req: NextRequest, body: unknown): Promise<Response> {
  try {
    await connectToDatabase();

    const authOptions = getAuthOptions(req);
    const handler = NextAuth(authOptions);

    const response = await handler(req, body);
    const res = await response;
    
    return res;

  } catch (error) {
    handleServerError({
      error,
      location: "handlers-getUser",
      report: true,
    });

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}