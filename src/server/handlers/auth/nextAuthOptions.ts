import NextAuth, { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getCsrfToken } from "next-auth/react";
import { SignInMessage } from "../../../utils/auth";
import connectToDatabase, { getMongoClient } from "@/server/db/mongodb";
import { findOrCreateUser } from "@/server/services/user";
import { ChainIdsEnum } from "@/types/wallet";
import { NextRequest, NextResponse } from "next/server";
import { handleServerError } from "@/utils/handleError";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { sendMagicLinkEmail } from "@/server/services/email";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { TITLE_COPY } from "@/textCopy/mainCopy";
import {
  AUTH_EMAIL_SIGNIN,
  AUTH_ERROR_ROUTE,
  AUTH_VERIFY_REQUEST_ROUTE,
} from "@/constants/serverRoutes";
import { AUTH_USER_COLLECTION_NAME } from "@/constants/databaseKeys";

// import TwitterProvider from "next-auth/providers/twitter";
// import AppleProvider from "next-auth/providers/apple";
// import GitHubProvider from "next-auth/providers/github";

const getProviders = () => {
  const appName = TITLE_COPY;
  const fromEmail =
    process.env.NODE_ENV === "development"
      ? "noreply@resend.dev"
      : "noreply@" + process.env.EMAIL_DOMAIN;

  const fromHeader = `${appName} <${fromEmail}>`;


  return [
    EmailProvider({
      from: fromEmail,
      async sendVerificationRequest({
        identifier: email,
        url,
        // token,
        // provider: { server, from },
      }) {
        // For development, just log the magic link instead of sending email
        if (process.env.NODE_ENV === "development") {
          console.log("🔗 Magic Link for development:", url);
          console.log("📧 Email would be sent to:", email);
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } else {
          // For production, use Resend API
          try {
            await sendMagicLinkEmail({
              to: email,
              magicLink: url,
              from: fromHeader,
              appName,
            });
          } catch (error) {
            handleServerError({
              error,
              location: "handlers-nextAuthOptions_sendVerificationRequest",
            });
            throw error;
          }
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
          state: "linkingPublicKey",
        },
      },
      // Ensure proper callback URL handling
      checks: ["state"],
      allowDangerousEmailAccountLinking: true,
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
            throw new Error("Could not validate the domain");
          }

          const csrfToken = await getCsrfToken({ req: { ...req, body: null } });

          if (signinMessage.nonce !== csrfToken) {
            throw new Error("Could not validate the csrf token");
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

          if (!sessionUser) {
            throw new Error("Could not find or create user");
          }

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
    adapter: MongoDBAdapter(getMongoClient(), {
      collections: {
        /** Schema defined in models/AuthUser.ts */
        Users: AUTH_USER_COLLECTION_NAME,
        Accounts: "authAccounts",
        Sessions: "authSessions",
        VerificationTokens: "authVerificationTokens",
      },
    }),
    providers: getProviders(),
    session: {
      strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
      signIn: AUTH_EMAIL_SIGNIN,
      error: AUTH_ERROR_ROUTE,
      verifyRequest: AUTH_VERIFY_REQUEST_ROUTE,
    },
    debug: process.env.NODE_ENV === "development",
    callbacks: {
      async jwt({
        token,
        user,
        account,
      }) {
        if (!user) {
          return token;
        }
        const isProviderAuth = account && account.provider !== "credentials";
        //"credentials" / blockchain wallet sign in is handled in the custom authorize callback

        // Handle user creation/fetching/linking after successful OAuth authentication
        if (isProviderAuth) {
          try {
            const email = user.email;

            if (!email) {
              throw new Error("Email not found in user");
            }
            
            const username =
              user.name?.replaceAll(" ", "") || email.split("@")[0];
            
            const sessionUser = await findOrCreateUser({
              authUserId: user.id,
              createData: {
                username,
                email,
              },
            });

            if (!sessionUser) {
              throw new Error(
                "Error creating user in provider authorization step"
              );
            }

            user = {
              ...user,
              ...sessionUser,
            };
          } catch (error) {
            handleServerError({
              error,
              location: `handlers-nextAuthOptions_jwt`,
            });

            //throw error to prevent sign in
            throw error;
          }
        }

        token.user = user;
        return token;
      },
      async session({ session, token }) {
        if (isAuthUser(token.user)) {
          session.user = token.user;
        } else {
          throw new Error("Bad session token, no auth user found")
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
    user !== null && typeof user === 'object' &&
    'id' in user && typeof user.id === 'string' &&
    'dbUserId' in user && typeof user.dbUserId === 'string'
  );
};


export async function authHandler(req: NextRequest, body: unknown): Promise<Response> {
  try {
    await connectToDatabase();

    const authOptions = getAuthOptions(req);
    const handler = NextAuth(authOptions);

    return handler(req, body);
  } catch (error) {
    handleServerError({
      error,
      location: "handlers-authHandler",
      report: true,
    });

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}