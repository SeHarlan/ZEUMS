import { getServerSession, User as NextAuthUser } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { getAuthOptions } from "@/server/handlers/auth/nextAuthOptions";
import { handleServerError } from "./handleError";


const UNAUTHORIZED_ERROR = "Unauthorized Session Request";
export async function getAuthSessionUser(req: NextRequest): Promise<NextAuthUser> {
  const authSession = await getServerSession(getAuthOptions(req));
  
  if (!authSession?.user) {
    /** Throws error if no auth session user found */
    throw new Error(UNAUTHORIZED_ERROR);
  }

  return authSession.user;
}


interface ErrorResponseProps {
  error: unknown;
  location: string;
  report?: boolean;
}
export function standardErrorResponses({
  error,
  location,
  report = false,
}: ErrorResponseProps) {
  handleServerError({
    error,
    location,
    report,
  });

  //
  if (error instanceof Error && error.message === UNAUTHORIZED_ERROR) {
    return NextResponse.json({ error: UNAUTHORIZED_ERROR }, { status: 401 });
  }

  // Check for validation errors from Mongoose with proper typing
  if (error instanceof Error && error.name === 'ValidationError') {
    return NextResponse.json(
      { error: "Validation error", details: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}