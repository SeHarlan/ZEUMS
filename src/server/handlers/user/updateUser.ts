import { UserType } from "@/types/user";
import { getAuthSessionUser, standardErrorResponses } from "@/utils/server";
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../db/mongodb";
import User, { CompleteUserVirtuals } from "../../models/User";

/** Keys allowed in PATCH body; ensures timelineTheme and other schema fields are persisted. */
const ALLOWED_UPDATE_KEYS: ReadonlyArray<keyof UserType> = [
  "displayName",
  "profileImage",
  "bannerImage",
  "backgroundImage",
  "backgroundTileCount",
  "backgroundTintHex",
  "backgroundTintOpacity",
  "backgroundBlur",
  "email",
  "bio",
  "socialHandles",
  "primaryTimeline",
  "hideCreatorDates",
  "hideCollectorDates",
  "timelineTheme",
] as const;

function buildUpdateSet(body: Record<string, unknown>): Partial<UserType> {
  const set: Record<string, unknown> = {};
  for (const key of ALLOWED_UPDATE_KEYS) {
    if (key in body) {
      set[key] = body[key];
    }
  }
  return set as Partial<UserType>;
}

export async function updateUserHandler(req: NextRequest): Promise<NextResponse> {
  try {
    await connectToDatabase();

    // Get the session to check authentication
    const authSessionUser = await getAuthSessionUser(req);

    // Parse the request body to get the update data
    const body = (await req.json()) as Record<string, unknown> | null;

    if (!body || typeof body !== "object" || Object.keys(body).length === 0) {
      throw new Error("No update data provided");
    }

    const updateData = buildUpdateSet(body);
    if (Object.keys(updateData).length === 0) {
      throw new Error("No update data provided");
    }

    // Find the user and update with the provided fields
    const updatedUser = await User.findByIdAndUpdate<UserType>(
      authSessionUser.dbUserId,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
        context: "query", // Ensure validators have proper context
        upsert: false,
      }
    ).populate(CompleteUserVirtuals);

    if (!updatedUser) {
      throw new Error("User not found");
    }

    // Return the updated user data
    return NextResponse.json({
      user: updatedUser,
    });
  } catch (error) {
    return standardErrorResponses({
      error,
      location: "handlers-updateUser",
      report: true,
    });
  }
}
