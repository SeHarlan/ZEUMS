import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../db/mongodb";
import User, { CompleteUserVirtuals } from "../../models/User";
import { UserType } from "@/types/user";
import { getAuthSessionUser, standardErrorResponses } from "@/utils/server";


export async function updateUserHandler(req: NextRequest): Promise<NextResponse> {
  try {
    await connectToDatabase();

    // Get the session to check authentication
    const authSessionUser = await getAuthSessionUser(req);

    // Parse the request body to get the update data
    const updateData: Partial<UserType> = (await req.json());

    // If no update data is provided, return an error
    if (!updateData || Object.keys(updateData).length === 0) {
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
