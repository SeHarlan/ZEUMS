import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../db/mongodb";
import { getAuthSessionUser, standardErrorResponses } from "@/utils/server";
import PendingEmailVerification from "@/server/models/PendingEmailVerification";
import { MongoServerError } from "mongodb";

const PENDING_VERIFICATION_EXPIRATION_TIME = 60 * 60 * 1000 * 24; //24 hrs

export async function createPendingEmailVerificationHandler(req: NextRequest): Promise<NextResponse> {
  await connectToDatabase();

  try {
    const authSessionUser = await getAuthSessionUser(req);

    const newPendingVerification: { email: string } = (await req.json());

    if(!newPendingVerification.email) {
      throw new Error("Email is required to create a pendingEmailVerification");
    }

    const expirationDate = new Date(Date.now() + PENDING_VERIFICATION_EXPIRATION_TIME);

    const pendingVerificationCreationData = {
      userId: authSessionUser.dbUserId,
      email: newPendingVerification.email,
      expiresAt: expirationDate,
    };

    try {
      await PendingEmailVerification.create(
        pendingVerificationCreationData
      );

      return NextResponse.json({ success: true });
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        // 11000 = Duplicate key error - handle gracefully
        // Update the users existing verification with new email and expires at
        await PendingEmailVerification.findOneAndUpdate(
          { userId: authSessionUser.dbUserId },
          {
            email: newPendingVerification.email,
            expiresAt: expirationDate,
          },
          { new: true }
        );

        return NextResponse.json({ success: true });
      } else {
        // Re-throw other errors
        throw error;
      }
    }
  } catch (error) {
    return standardErrorResponses({
      error,
      location: "handlers-createPendingEmailVerification",
      report: true,
    });
  }
}
