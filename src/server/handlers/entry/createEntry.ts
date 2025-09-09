import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../db/mongodb";
import { getAuthSessionUser, standardErrorResponses } from "@/utils/server";
import Entry from "../../models/Entry/Entry";
import { TimelineEntryCreation } from "@/types/entry";

export async function createEntryHandler(req: NextRequest): Promise<NextResponse> {
  await connectToDatabase();

  try {
    const authSessionUser = await getAuthSessionUser(req);
    const newEntry = (await req.json()) as TimelineEntryCreation;
    
    // Create entry based on entry type
    const entryCreationData = {
      ...newEntry,
      owner: authSessionUser.dbUserId,
    };
    
    // Create the entry directly through the base model
    // Mongoose will use the right discriminator based on entryType
    const createdEntry = await Entry.create(entryCreationData);

    if (!createdEntry) {
      throw new Error("Failed to create new entry");
    }

    return NextResponse.json({ createdEntry });
  } catch (error) {
    return standardErrorResponses({
      error,
      location: "handlers-createEntry",
      report: true,
    }); 
  } 
}
