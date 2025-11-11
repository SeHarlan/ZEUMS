import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../db/mongodb";
import { getAuthSessionUser, standardErrorResponses } from "@/utils/server";
import GalleryItem from "../../models/Gallery/GalleryItem";
import { GalleryItemCreation } from "@/types/galleryItem";

export async function createGalleryItemHandler(req: NextRequest): Promise<NextResponse> {
  await connectToDatabase();

  try {
    const authSessionUser = await getAuthSessionUser(req);
    const newGalleryItem = (await req.json()) as GalleryItemCreation;
    // Create gallery item based on item type
    const galleryItemCreationData = {
      ...newGalleryItem,
      owner: authSessionUser.dbUserId,
    };
    
    // Create the gallery item directly through the base model
    // Mongoose will use the right discriminator based on itemType
    const createdGalleryItem = await GalleryItem.create(galleryItemCreationData);

    if (!createdGalleryItem) {
      throw new Error("Failed to create new gallery item");
    }

    return NextResponse.json({ createdGalleryItem });
  } catch (error) {
    return standardErrorResponses({
      error,
      location: "handlers-createGalleryItem",
      report: true,
    }); 
  } 
}
