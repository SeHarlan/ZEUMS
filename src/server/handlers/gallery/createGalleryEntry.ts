import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../db/mongodb";
import { getAuthSessionUser, standardErrorResponses } from "@/utils/server";
import { Entry } from "../../models/Entry/Entry";
import { EntryTypes } from "@/types/entry";
import { z } from "zod";
import mongoose from "mongoose";

const CreateGalleryEntrySchema = z.object({
  galleryId: z.string().min(1, "Gallery ID is required"),
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
});

export async function createGalleryEntryHandler(req: NextRequest): Promise<NextResponse> {
  await connectToDatabase();

  try {
    const authSessionUser = await getAuthSessionUser(req);
    const body = await req.json();
    const validatedData = CreateGalleryEntrySchema.parse(body);

    if (!mongoose.Types.ObjectId.isValid(validatedData.galleryId)) {
      return NextResponse.json({ error: "Invalid gallery ID" }, { status: 400 });
    }

    // Create the gallery entry
    const galleryEntry = await Entry.create({
      entryType: EntryTypes.Gallery,
      owner: authSessionUser.dbUserId,
      title: validatedData.title,
      description: validatedData.description,
      galleryId: validatedData.galleryId,
      source: "creator", // Gallery entries are always creator source
    });

    if (!galleryEntry) {
      throw new Error("Failed to create gallery entry");
    }

    return NextResponse.json({ galleryEntry });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    return standardErrorResponses({
      error,
      location: "handlers-createGalleryEntry",
      report: true,
    });
  }
}