import { GalleryType } from "@/types/gallery";
import { removeUndefined } from "@/utils/general";
import { getAuthSessionUser, standardErrorResponses } from "@/utils/server";
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../db/mongodb";
import Gallery, { GalleryWithBasicOwnerPopulate, GalleryWithItemsPopulate } from "../../models/Gallery/Gallery";

export async function updateGalleryHandler(req: NextRequest): Promise<NextResponse> {
  await connectToDatabase();

  try {
    const authSessionUser = await getAuthSessionUser(req);
    const { _id, title, description, hideItemTitles, hideItemDescriptions, bannerImage } =
      (await req.json()) as Pick<
        GalleryType,
        | "_id"
        | "title"
        | "description"
        | "hideItemTitles"
        | "hideItemDescriptions"
        | "bannerImage"
      >;
    
    // Validate required fields
    if (!_id) {
      throw new Error("Gallery ID is required");
    }
    
    if (!title || title.trim().length === 0) {
      throw new Error("Title is required");
    }

    const allowedUpdates = removeUndefined({
      title,
      description,
      hideItemTitles,
      hideItemDescriptions,
      bannerImage,
    })

    // Update gallery data
    const updatedGallery = await Gallery.findOneAndUpdate(
      { 
        _id: _id,
        owner: authSessionUser.dbUserId 
      },
      allowedUpdates,
      { new: true }
    ).populate([GalleryWithItemsPopulate, GalleryWithBasicOwnerPopulate]);

    if (!updatedGallery) {
      throw new Error("Gallery not found or failed to update");
    }

    return NextResponse.json({ updatedGallery });
  } catch (error) {
    return standardErrorResponses({
      error,
      location: "handlers-updateGallery",
      report: true,
    }); 
  } 
}
