import { User as NextAuthUser, Session as NextAuthSession } from "next-auth"
import type { AdapterUser as NextAuthAdapterUser } from "next-auth/adapters"
import type { JWT as NextAuthJWT } from "next-auth/jwt"

interface BaseAuthUser {
  /** The id of the user from the auth database */
  id: string;
  /** 
   * The id of main user model, 
   * It will be found in valid JWT tokens and ServerSession objects 
   **/
  dbUserId?: string;
} 

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface User extends NextAuthUser, BaseAuthUser { }
  interface Session extends NextAuthSession {
    user: User | null;
    accessToken: string;
  }
}

declare module "next-auth/adapters" {
  //only be stored in the jwt token, not the in the auth database
  interface AdapterUser extends NextAuthAdapterUser, BaseAuthUser { }

}

declare module "next-auth/jwt" {
  interface JWT extends NextAuthJWT {
    user: BaseAuthUser | null;
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