import { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface User extends DefaultSession["user"] {
    id: string;
    publicKey?: string;
    email?: string;
  } 

  interface JWT {
    user: User | null;
  }

  interface Session {
    user: User | null;
    accessToken: string;
  }
}
