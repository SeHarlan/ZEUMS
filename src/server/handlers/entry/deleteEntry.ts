import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../db/mongodb";
import { getAuthSessionUser, standardErrorResponses } from "@/utils/server";
import Entry from "../../models/Entry/Entry";

export async function deleteEntryHandler(
  req: NextRequest
): Promise<NextResponse> {
  await connectToDatabase();

  try {
    const authSessionUser = await getAuthSessionUser(req);

    // Get the id from query parameters
    const { searchParams } = new URL(req.url);
    const entryToDeleteId = searchParams.get('id');

    const deleteResult = await Entry.deleteOne({
      _id: entryToDeleteId,
      owner: authSessionUser.dbUserId,
    })

    if (!deleteResult.acknowledged || deleteResult.deletedCount === 0) {
      throw new Error("Entry not found or failed to delete");
    }

    return NextResponse.json(deleteResult);
  } catch (error) {
    return standardErrorResponses({
      error,
      location: "handlers-deleteEntry",
      report: true,
    });
  }
}
