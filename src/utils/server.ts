import { DUPLICATE_KEY_ERROR, UNAUTHORIZED_ERROR } from "@/constants/errors";
import { getAuthOptions } from "@/server/handlers/auth/nextAuthOptions";
import { MongoServerError } from "mongodb";
import { getServerSession, User as NextAuthUser } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { handleServerError } from "./handleError";


export async function getAuthSessionUser(req: NextRequest): Promise<NextAuthUser> {
  const authSession = await getServerSession(getAuthOptions(req));
  
  if (!authSession?.user?.dbUserId) {
    //VERY IMPORTANT! - never remove this check, it is crucial for database integrity
    /** Throws error if no auth session user found or if token doesn't match our custom format */
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

  if (error instanceof MongoServerError && error.code === 11000) {
    return NextResponse.json({ error: DUPLICATE_KEY_ERROR }, { status: 400 });
  }
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