import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../db/mongodb";
import { getAuthSessionUser, standardErrorResponses } from "@/utils/server";
import GalleryItem from "../../models/Gallery/GalleryItem";

export async function deleteGalleryItemHandler(
  req: NextRequest
): Promise<NextResponse> {
  await connectToDatabase();

  try {
    const authSessionUser = await getAuthSessionUser(req);

    // Get the id from query parameters
    const { searchParams } = new URL(req.url);
    const galleryItemToDeleteId = searchParams.get('id');

    const deleteResult = await GalleryItem.deleteOne({
      _id: galleryItemToDeleteId,
      owner: authSessionUser.dbUserId,
    })

    if (!deleteResult.acknowledged || deleteResult.deletedCount === 0) {
      throw new Error("Gallery item not found or failed to delete");
    }

    return NextResponse.json(deleteResult);
  } catch (error) {
    return standardErrorResponses({
      error,
      location: "handlers-deleteGalleryItem",
      report: true,
    });
  }
}
