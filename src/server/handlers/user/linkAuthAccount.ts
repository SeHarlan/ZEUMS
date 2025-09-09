import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../db/mongodb";
import { getAuthSessionUser, standardErrorResponses } from "@/utils/server";
import PendingEmailVerification from "@/server/models/PendingEmailVerification";

export async function linkAuthAccountHandler(req: NextRequest): Promise<NextResponse> {
  await connectToDatabase();

  try {
    const authSessionUser = await getAuthSessionUser(req);

    const newPendingVerification: { email: string } = (await req.json());

    if(!newPendingVerification.email) {
      throw new Error("Email is required to create a pendingEmailVerification");
    }

    const pendingVerificationCreationData = {
      userId: authSessionUser.dbUserId,
      email: newPendingVerification.email,
      // expiresAt: new Date(Date.now() + hours * 60 * 60 * 1000)
    };

    const createdPendingVerification = await PendingEmailVerification.create(
      pendingVerificationCreationData
    );

    if (!createdPendingVerification) {
      throw new Error("Failed to create new pendingEmailVerification");
    }

    return NextResponse.json({ createdPendingVerification });
  } catch (error) {
    return standardErrorResponses({
      error,
      location: "handlers-linkAuthAccount",
      report: true,
    });
  }
}
