import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../db/mongodb";
import User, { CompleteUserVirtuals } from "../../models/User";
import { BaseUserType, UserType } from "@/types/user";
import { ProfileDisplayFormValues } from "@/forms/editProfileDisplayInformation";
import { AccountDetailsFormValues } from "@/forms/editProfileAccountDetails";
import { getAuthSessionUser, standardErrorResponses } from "@/utils/server";


export async function updateUserHandler(req: NextRequest): Promise<NextResponse> {
  try {
    await connectToDatabase();

    // Get the session to check authentication
    const authSessionUser = await getAuthSessionUser(req);

    // Parse the request body to get the update data
    const rawUpdateData = (await req.json()) as
      | ProfileDisplayFormValues
      | AccountDetailsFormValues;

    // If no update data is provided, return an error
    if (!rawUpdateData || Object.keys(rawUpdateData).length === 0) {
      return NextResponse.json(
        { error: "No update data provided" },
        { status: 400 }
      );
    }

    // Format the update data to match the MongoDB schema
    const updateData: Partial<BaseUserType> = rawUpdateData;

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
      return NextResponse.json({ error: "User not found" }, { status: 404 });
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
