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
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    if (!collection || !["User", "AuthUser"].includes(collection)) {
      return NextResponse.json(
        { error: "Collection must be either 'User' or 'AuthUser'" },
        { status: 400 }
      );
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
