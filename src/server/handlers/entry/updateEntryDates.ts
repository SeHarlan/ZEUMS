import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../db/mongodb";
import { getAuthSessionUser, standardErrorResponses } from "@/utils/server";
import Entry from "../../models/Entry/Entry";
import { TimelineEntryDateUpdate } from "@/types/entry";

export async function updateEntryDatesHandler(
  req: NextRequest
): Promise<NextResponse> {
  await connectToDatabase();

  try {
    const authSessionUser = await getAuthSessionUser(req);

    const datesToUpdate = (await req.json()) as TimelineEntryDateUpdate[];

    if (!Array.isArray(datesToUpdate) || datesToUpdate.length === 0) {
      throw new Error("Invalid dates data");
    }
    
    // Use bulkWrite for efficient batch updates
    const bulkOps = datesToUpdate.map((update) => ({
      updateOne: {
        filter: {
          _id: update._id,
          owner: authSessionUser.dbUserId,
        },
        update: {
          $set: { date: update.date },
        }
      },
    }));

    const bulkWriteResult = await Entry.bulkWrite(bulkOps, {
      ordered: false, // Continue even if some operations fail
    });

    return NextResponse.json({ bulkWriteResult });
  } catch (error) {
    return standardErrorResponses({
      error,
      location: "handlers-updateEntryDates",
      report: true,
    });
  }
}
