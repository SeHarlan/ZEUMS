import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../db/mongodb";
import { getAuthSessionUser, standardErrorResponses } from "@/utils/server";
import GalleryItem from "../../models/Gallery/GalleryItem";
import { BaseGalleryItem } from "@/types/galleryItem";
import { removeUndefined } from "@/utils/general";

export async function updateGalleryItemHandler(
  req: NextRequest
): Promise<NextResponse> {
  await connectToDatabase();

  try {
    const authSessionUser = await getAuthSessionUser(req);

    const body = (await req.json()) as BaseGalleryItem;

    if (!body._id) {
      throw new Error("Gallery item ID is required");
    }

    const allowedUpdates = {
      title: body.title,
      description: body.description,
      buttons: body.buttons,
    };

    const updateData = removeUndefined(allowedUpdates)

    const updatedGalleryItem = await GalleryItem.findOneAndUpdate(
      {
        _id: body._id,
        owner: authSessionUser.dbUserId,
      },
      {
        $set: updateData,
      },
      {
        new: true, // Return the updated document
        runValidators: true, // Validate the update against the schema
      }
    );

    if (!updatedGalleryItem) {
      throw new Error("Gallery item not found or failed to update");
    }

    return NextResponse.json({ updatedGalleryItem });
  } catch (error) {
    return standardErrorResponses({
      error,
      location: "handlers-updateGalleryItem",
      report: true,
    });
  }
}
