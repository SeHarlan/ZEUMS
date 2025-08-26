import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../db/mongodb";
import { getAuthSessionUser, standardErrorResponses } from "@/utils/server";
import Entry from "../../models/Entry/Entry";
import { TimelineEntryCreation } from "@/types/entry";

export async function createBlockchainEntriesHandler(
  req: NextRequest
): Promise<NextResponse> {
  await connectToDatabase();

  try {
    const authSessionUser = await getAuthSessionUser(req);

    const newEntries = (await req.json()) as TimelineEntryCreation[];

    // Validate input
    if (!Array.isArray(newEntries) || newEntries.length === 0) {
      throw new Error("Invalid entries data");
    }
    // Add user ID and timestamps to each entry
    const entriesWithUser = newEntries.map((entry) => ({
      ...entry,
      owner: authSessionUser.id,
    }));
  
    // Create multiple entries at once
    const createdEntries = await Entry.insertMany(entriesWithUser, {
      ordered: false, // Continue inserting even if some fail
      // rawResult: true, // Get the raw result to check insertedCount
    });

    if (!createdEntries || createdEntries.length === 0) {
      throw new Error("Failed to create entries");
    }

    return NextResponse.json({createdEntries});
  } catch (error) {
    return standardErrorResponses({
      error,
      location: "handlers-createBlockchainEntries",
      report: true,
    });
  }
}
