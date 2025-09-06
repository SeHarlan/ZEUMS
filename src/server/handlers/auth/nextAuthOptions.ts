import NextAuth, { NextAuthOptions, Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getCsrfToken } from "next-auth/react";
import { SignInMessage } from "../../../utils/auth";
import connectToDatabase from "@/server/db/mongodb";
import { findOrCreateUser } from "@/server/services/user";
import { ChainIdsEnum } from "@/types/wallet";
import { NextRequest, NextResponse } from "next/server";
import { handleServerError } from "@/utils/handleError";
import GoogleProvider from "next-auth/providers/google";
// import TwitterProvider from "next-auth/providers/twitter";
// import AppleProvider from "next-auth/providers/apple";
// import GitHubProvider from "next-auth/providers/github";

const getProvider = () => {
  return [
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

          const user = await findOrCreateUser({
            wallet: {
              type: ChainIdsEnum.SOLANA,
              address: signinMessage.publicKey,
            },
            createData: {
              username: signinMessage.publicKey,
            },
          });

          if (!user) return null;

          return {
            id: user._id,
            publicKey: signinMessage.publicKey,
          };
        } catch (e) {
          handleServerError({
            error: e,
            location: "handlers-nextAuthOptions",
          });
          return null;
        }
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
  ];
}



// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getAuthOptions = (req: NextRequest) => {
  const providers = getProvider();

  // const isDefaultSigninPage =
  // req.method === "GET" && req.query.nextauth?.includes("signin");

  // // Hides Sign-In with Solana from the default sign page
  // if (isDefaultSigninPage) {
  //   providers.pop();
  // }

  const config: NextAuthOptions = {
    providers,
    session: {
      strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
      signIn: "/api/auth/signin",
      error: "/api/auth/error",
    },
    debug: process.env.NODE_ENV === "development",
    callbacks: {
      async signIn({ user, account }) {
        // Only handle OAuth providers (not Solana credentials)
        if (account?.provider && account.provider !== "credentials") {
          try {
            if (!user.email) {
              // email is required for oauth based user creation
              throw new Error("Email is required for proper authentication");
            }

            // Create or find user using your existing service
            const dbUser = await findOrCreateUser({
              account: account,
              createData: {
                username: user.name?.replaceAll(" ", "") || user.email.split('@')[0],
                email: user.email,
              },
            });

            if (!dbUser) {
              return false; // Sign in failed
            }

            // Attach the database user ID to the NextAuth user object
            user.id = dbUser._id;
            return true;
          } catch (error) {
            handleServerError({
              error,
              location: "handlers-nextAuthOptions_signIn",
            });
            return false;
          }
        }

        // For Solana credentials, let it proceed normally
        return true;
      },
      async jwt({ token, user, account }) {
        if (user) {
          token.user = user;
        }
        if (account) {
          token.account = account;
        }
        return token;
      },
      async session({ session, token }) {
        if (token.user) {
          session.user = token.user as Session["user"];
        } else {
          session.user = null;
        }
        return session;
      },
    },
  };

  return config;
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