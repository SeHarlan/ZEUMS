import { NextResponse } from "next/server";
import connectToDatabase from "../../db/mongodb";
import User, { PublicUserVirtuals, UsernameCollation } from "../../models/User";
import { PublicUserType } from "@/types/user";
import { standardErrorResponses } from "@/utils/server";

export async function getPublicUserByUsernameHandler(
  username: string
): Promise<NextResponse> {
  try {
    await connectToDatabase();

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    const user = await User.findOne<PublicUserType>({ username })
      .collation(UsernameCollation)
      .populate(PublicUserVirtuals)
      .exec();
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    return standardErrorResponses({
      error,
      location: "handlers-getPublicUserByUsername",
      report: true,
    }); 
  }
}
