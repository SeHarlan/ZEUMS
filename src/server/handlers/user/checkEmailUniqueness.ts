import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../db/mongodb";
import User from "../../models/User";
import AuthUser from "../../models/AuthUser";
import { standardErrorResponses } from "@/utils/server";


export async function checkEmailUniquenessHandler(req: NextRequest): Promise<NextResponse> {
  try {
    await connectToDatabase();

    const { email, collection } = await req.json();
    
    if (!email || typeof email !== "string") {
      throw new Error("Email is required");
    }

    if (!collection || !["User", "AuthUser"].includes(collection)) {
      throw new Error("Collection must be either 'User' or 'AuthUser'");
    }
    
    // Use case-insensitive regex for MongoDB query
    const query = { email: { $regex: new RegExp(`^${email}$`, "i") } };
    
    let existingUser;
    if (collection === "User") {
      existingUser = await User.findOne(query).select("_id").lean();
    } else {
      existingUser = await AuthUser.findOne(query).select("_id").lean();
    }
    
    const isUnique = !existingUser; // true if unique (no user found), false if taken
    
    return NextResponse.json({ isUnique });
  } catch (error) {
    return standardErrorResponses({
      error,
      location: "handlers-checkEmailUniqueness",
      report: true,
    });
  }
}
