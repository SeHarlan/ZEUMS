import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../db/mongodb";
import { getAuthSessionUser, standardErrorResponses } from "@/utils/server";
import Entry from "../../models/Entry/Entry";
import { BaseEntry } from "@/types/entry";
import { removeUndefined } from "@/utils/general";

export async function updateEntryHandler(
  req: NextRequest
): Promise<NextResponse> {
  await connectToDatabase();

  try {
    const authSessionUser = await getAuthSessionUser(req);

    const body = (await req.json()) as BaseEntry;

    if (!body._id) {
      throw new Error("Entry ID is required");
    }

    const allowedUpdates = {
      title: body.title,
      description: body.description,
      buttons: body.buttons,
      date: body.date,
    };

    const updateData = removeUndefined(allowedUpdates)

    const updatedEntry = await Entry.findOneAndUpdate(
      {
        _id: body._id,
        owner: authSessionUser.id,
      },
      {
        $set: updateData,
      },
      {
        new: true, // Return the updated document
        runValidators: true, // Validate the update against the schema
      }
    );

    if (!updatedEntry) {
      throw new Error("Entry not found or failed to update");
    }

    return NextResponse.json({ updatedEntry });
  } catch (error) {
    return standardErrorResponses({
      error,
      location: "handlers-updateEntry",
      report: true,
    });
  }
}
