import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../db/mongodb";
import { getAuthSessionUser, standardErrorResponses } from "@/utils/server";
import Gallery from "../../models/Gallery";
import { GalleryDisplayTypes } from "@/types/gallery";
import { z } from "zod";
import mongoose from "mongoose";

const UpdateGallerySchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  displayType: z.nativeEnum(GalleryDisplayTypes).optional(),
  itemIds: z.array(z.string()).optional(),
});

export async function updateGalleryHandler(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  await connectToDatabase();

  try {
    const authSessionUser = await getAuthSessionUser(req);
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid gallery ID" }, { status: 400 });
    }

    const body = await req.json();
    const validatedData = UpdateGallerySchema.parse(body);

    const gallery = await Gallery.findOneAndUpdate(
      { _id: params.id, owner: authSessionUser.dbUserId },
      validatedData,
      { new: true, runValidators: true }
    ).populate('itemIds');

    if (!gallery) {
      return NextResponse.json({ error: "Gallery not found" }, { status: 404 });
    }

    return NextResponse.json({ gallery });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    return standardErrorResponses({
      error,
      location: "handlers-updateGallery",
      report: true,
    });
  }
}