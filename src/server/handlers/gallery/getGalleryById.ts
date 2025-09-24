import { NextResponse } from "next/server";
import connectToDatabase from "../../db/mongodb";
import { standardErrorResponses } from "@/utils/server";
import Gallery, { GalleryWithItemsPopulate } from "../../models/Gallery/Gallery";

export async function getGalleryByIdHandler(galleryId: string): Promise<NextResponse> {
  await connectToDatabase();

  try {
    if (!galleryId) {
      throw new Error("Gallery ID is required");
    }

    // Fetch gallery with populated items
    const gallery = await Gallery.findById(galleryId)
      .populate(GalleryWithItemsPopulate)
      .exec();

    if (!gallery) {
      throw new Error("Gallery not found");
    }

    return NextResponse.json({ gallery});
  } catch (error) {
    return standardErrorResponses({
      error,
      location: "handlers-getGalleryById",
      report: true,
    }); 
  } 
}
