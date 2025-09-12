import { User as NextAuthUser } from "next-auth"
import type { AdapterUser as NextAuthAdapterUser } from "next-auth/adapters"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface User extends NextAuthUser {
    /** The id of the user from the auth database */
    id: string;
    /** The id of the user from the main database */
    dbUserId: string;
  } 
  interface JWT {
    user: SessionAuthUser | null;
  }

  interface Session {
    user: User | null;
    accessToken: string;
  }
}

declare module "next-auth/adapters" {
  interface AdapterUser extends NextAuthAdapterUser {
    //only be stored in the jwt token, not the in the auth database
    dbUserId?: string;
  }
}

export type AuthUserType = {
  email: string;
  name?: string;
  emailVerified?: Date;
};

export type PendingEmailVerificationType = {
  userId: string;
  email: string;
  expiresAt: Date;
};