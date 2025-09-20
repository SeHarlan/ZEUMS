import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../db/mongodb";
import { getAuthSessionUser, standardErrorResponses } from "@/utils/server";
import Gallery from "../../models/Gallery";
import mongoose from "mongoose";

export async function deleteGalleryHandler(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  await connectToDatabase();

  try {
    const authSessionUser = await getAuthSessionUser(req);
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid gallery ID" }, { status: 400 });
    }

    const gallery = await Gallery.findOneAndDelete({ 
      _id: params.id, 
      owner: authSessionUser.dbUserId 
    });

    if (!gallery) {
      return NextResponse.json({ error: "Gallery not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Gallery deleted successfully" });
  } catch (error) {
    return standardErrorResponses({
      error,
      location: "handlers-deleteGallery",
      report: true,
    });
  }
}