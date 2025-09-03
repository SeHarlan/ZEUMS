import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../db/mongodb";
import User, { CompleteUserVirtuals } from "../../models/User";
import { UserType } from "@/types/user";
import { getAuthSessionUser, standardErrorResponses } from "@/utils/server";

export async function getUserHandler(req: NextRequest): Promise<NextResponse> {
  try {
    await connectToDatabase();

    // Get the session to check authentication
    const authSessionUser = await getAuthSessionUser(req);

    const user = await User.findById<UserType>(authSessionUser.id)
      .populate(CompleteUserVirtuals)
      .exec();
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }


    // Return user data
    return NextResponse.json({
      user: user,
    });
  } catch (error) {
    return standardErrorResponses({
      error,
      location: "handlers-getUser",
      report: true,
    }); 
  }
}