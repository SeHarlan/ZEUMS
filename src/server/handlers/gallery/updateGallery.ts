import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../db/mongodb";
import { getAuthSessionUser, standardErrorResponses } from "@/utils/server";
import Gallery, { GalleryWithItemsPopulate } from "../../models/Gallery/Gallery";
import { GalleryType } from "@/types/gallery";

export async function updateGalleryHandler(req: NextRequest): Promise<NextResponse> {
  await connectToDatabase();

  try {
    const authSessionUser = await getAuthSessionUser(req);
    const { _id, title, description } = (await req.json()) as Pick<GalleryType, "_id" | "title" | "description">;
    
    // Validate required fields
    if (!_id) {
      throw new Error("Gallery ID is required");
    }
    
    if (!title || title.trim().length === 0) {
      throw new Error("Title is required");
    }

    // Update gallery data
    const updatedGallery = await Gallery.findOneAndUpdate(
      { 
        _id: _id,
        owner: authSessionUser.dbUserId 
      },
      { 
        title: title.trim(),
        description: description?.trim() || undefined
      },
      { new: true }
    ).populate(GalleryWithItemsPopulate);

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
