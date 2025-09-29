import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../db/mongodb";
import { getAuthSessionUser, standardErrorResponses } from "@/utils/server";
import { GalleryItemCreation } from "@/types/galleryItem";
import GalleryItem from "@/server/models/Gallery/GalleryItem";

export async function createBlockchainItemsHandler(
  req: NextRequest
): Promise<NextResponse> {
  await connectToDatabase();

  try {
    const authSessionUser = await getAuthSessionUser(req);

    const newGalleryItems = (await req.json()) as GalleryItemCreation[];

    // Validate input
    if (!Array.isArray(newGalleryItems) || newGalleryItems.length === 0) {
      throw new Error("Invalid Gallery Items data");
    }
    // Add user ID and timestamps to each entry
    const galleryItemsWithUser = newGalleryItems.map((galleryItem) => ({
      ...galleryItem,
      owner: authSessionUser.dbUserId,
    }));

    // Create multiple GalleryItems at once
    const rawCreatedGalleryItems = await GalleryItem.insertMany(galleryItemsWithUser, {
      ordered: false, // Continue inserting even if some fail
      // rawResult: true, // Get the raw result to check insertedCount
    });

    if (!rawCreatedGalleryItems || rawCreatedGalleryItems.length === 0) {
      throw new Error("Failed to create gallery items");
    }

    const createdGalleryItems = rawCreatedGalleryItems.sort((a, b) => { 
      //first sort by row, then in each row sort by column
      if (a.position[0] !== b.position[0]) {
        return a.position[0] - b.position[0];
      }
      return a.position[1] - b.position[1];
    })

    return NextResponse.json({ createdGalleryItems });
  } catch (error) {
    return standardErrorResponses({
      error,
      location: "handlers-createBlockchainGalleryItems",
      report: true,
    });
  }
}
