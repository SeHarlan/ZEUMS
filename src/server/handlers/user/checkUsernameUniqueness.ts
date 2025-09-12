import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../db/mongodb";
import User from "../../models/User";
import { standardErrorResponses } from "@/utils/server";

export async function checkUsernameUniquenessHandler(req: NextRequest): Promise<NextResponse> {
  try {
    await connectToDatabase();

    const { username } = await req.json();
    
    if (!username || typeof username !== "string") {
      throw new Error("Username is required");
    }
    
    // Use case-insensitive regex for MongoDB query
    const existingUser = await User.findOne({
      username: { $regex: new RegExp(`^${username}$`, "i") }
    }).select("_id").lean();
    
    const isUnique = !existingUser; // true if unique (no user found), false if taken
    
    return NextResponse.json({ isUnique });
  } catch (error) {
    return standardErrorResponses({
      error,
      location: "handlers-checkUsernameUniqueness",
      report: true,
    });
  }
}
