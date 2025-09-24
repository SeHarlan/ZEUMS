import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../db/mongodb";
import { getAuthSessionUser, standardErrorResponses } from "@/utils/server";
import Gallery from "../../models/Gallery/Gallery";
import { GalleryType } from "@/types/gallery";

export async function createGalleryHandler(req: NextRequest): Promise<NextResponse> {
  await connectToDatabase();

  try {
    const authSessionUser = await getAuthSessionUser(req);
    const { title, description, source } = (await req.json()) as Pick<GalleryType, "title" | "description" | "source">;
    
    // Validate required fields
    if (!title || title.trim().length === 0) {
      throw new Error("Title is required");
    }

    // Create gallery data
    const galleryCreationData = {
      title: title,
      description: description,
      source: source,
      owner: authSessionUser.dbUserId,
    };
    
    // Create the gallery
    const newGallery = await Gallery.create(galleryCreationData);

    if (!newGallery) {
      throw new Error("Failed to create new gallery");
    }

    return NextResponse.json({ newGallery });
  } catch (error) {
    return standardErrorResponses({
      error,
      location: "handlers-createGallery",
      report: true,
    }); 
  } 
}