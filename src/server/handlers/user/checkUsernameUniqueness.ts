import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../db/mongodb";
import User from "../../models/User";
import { standardErrorResponses } from "@/utils/server";
import { isUsernameBanned } from "@/constants/bannedUsernames";

export async function checkUsernameUniquenessHandler(req: NextRequest): Promise<NextResponse> {
  try {
    await connectToDatabase();

    const { username } = await req.json();
    
    if (!username || typeof username !== "string") {
      throw new Error("Username is required");
    }
    
    // Check if username is banned
    if (isUsernameBanned(username)) {
      return NextResponse.json({ 
        isUnique: false, 
        error: "This username is not available. Please choose another." 
      });
    }
    
    // Use exact match with lowercase - much more efficient with unique index
    const existingUser = await User.findOne({ username: username.toLowerCase() })
      .select("_id")
      .lean();
    
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
