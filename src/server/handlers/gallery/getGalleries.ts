import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../db/mongodb";
import { getAuthSessionUser, standardErrorResponses } from "@/utils/server";
import Gallery from "../../models/Gallery";

export async function getGalleriesHandler(req: NextRequest): Promise<NextResponse> {
  await connectToDatabase();

  try {
    const authSessionUser = await getAuthSessionUser(req);
    
    const galleries = await Gallery.find({ owner: authSessionUser.dbUserId })
      .populate('itemIds')
      .sort({ updatedAt: -1 });

    return NextResponse.json({ galleries });
  } catch (error) {
    return standardErrorResponses({
      error,
      location: "handlers-getGalleries",
      report: true,
    });
  }
}