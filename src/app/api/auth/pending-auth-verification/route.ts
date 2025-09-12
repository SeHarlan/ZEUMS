import { createPendingEmailVerificationHandler } from "@/server/handlers/auth/createPendingEmailVerification";

//custom auth route (not part of next-auth)
export { createPendingEmailVerificationHandler as POST };
