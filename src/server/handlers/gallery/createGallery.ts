import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../db/mongodb";
import { getAuthSessionUser, standardErrorResponses } from "@/utils/server";
import Gallery from "../../models/Gallery";
import { GalleryDisplayTypes } from "@/types/gallery";
import { z } from "zod";

const CreateGallerySchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  displayType: z.nativeEnum(GalleryDisplayTypes).default(GalleryDisplayTypes.Grid),
  itemIds: z.array(z.string()).default([]),
});

export async function createGalleryHandler(req: NextRequest): Promise<NextResponse> {
  await connectToDatabase();

  try {
    const authSessionUser = await getAuthSessionUser(req);
    const body = await req.json();
    const validatedData = CreateGallerySchema.parse(body);

    const galleryData = {
      ...validatedData,
      owner: authSessionUser.dbUserId,
    };

    const createdGallery = await Gallery.create(galleryData);

    if (!createdGallery) {
      throw new Error("Failed to create new gallery");
    }

    // Populate the items
    await createdGallery.populate('itemIds');

    return NextResponse.json({ gallery: createdGallery });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    return standardErrorResponses({
      error,
      location: "handlers-createGallery",
      report: true,
    });
  }
}