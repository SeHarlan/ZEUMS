import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../db/mongodb";
import { getAuthSessionUser, standardErrorResponses } from "@/utils/server";
import Gallery from "../../models/Gallery/Gallery";
import GalleryItem from "../../models/Gallery/GalleryItem";
import mongoose from "mongoose";

export async function deleteGalleryHandler(
  req: NextRequest
): Promise<NextResponse> {
  await connectToDatabase();

  const session = await mongoose.startSession();
  
  try {
    const result = await session.withTransaction(async () => {
      const authSessionUser = await getAuthSessionUser(req);

      // Get the id from query parameters
      const { searchParams } = new URL(req.url);
      const galleryToDeleteId = searchParams.get('id');

      if (!galleryToDeleteId) {
        throw new Error("Gallery ID is required");
      }

      if (!authSessionUser.dbUserId) {
        throw new Error("Safety fallback: main User Id is required");
      }

      // First, delete all gallery items associated with this gallery
      const galleryItemsDeleteResult = await GalleryItem.deleteMany(
        {
          parentGalleryId: galleryToDeleteId,
          owner: authSessionUser.dbUserId,
        },
        { session }
      );

      // Then, delete the gallery itself
      const galleryDeleteResult = await Gallery.deleteOne(
        {
          _id: galleryToDeleteId,
          owner: authSessionUser.dbUserId,
        },
        { session }
      );

      if (!galleryDeleteResult.acknowledged || galleryDeleteResult.deletedCount === 0) {
        throw new Error("Gallery not found or failed to delete");
      }

      // Return the combined result
      return {
        acknowledged: galleryDeleteResult.acknowledged,
        deletedCount: galleryDeleteResult.deletedCount,
        galleryItemsDeleted: galleryItemsDeleteResult.deletedCount,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    // Explicitly abort the transaction if it's still active
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    
    return standardErrorResponses({
      error,
      location: "handlers-deleteGallery",
      report: true,
    });
  } finally {
    await session.endSession();
  }
}
