import { UploadCategory } from "@/constants/uploadCategories";
import {
  GalleryItem as GalleryItemType,
  isUserAssetGalleryItem,
} from "@/types/galleryItem";
import { CdnIdType, isUserImage, isUserMedia, } from "@/types/media";
import { makeUserImageBlobKey, makeUserVideoBlobKey } from "@/utils/clientImageUpload";
import { getAuthSessionUser, standardErrorResponses } from "@/utils/server";
import { del } from "@vercel/blob";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../db/mongodb";
import Gallery from "../../models/Gallery/Gallery";
import GalleryItem from "../../models/Gallery/GalleryItem";

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

      // First, fetch all gallery items to delete their blobs if needed
      const galleryItemsToDelete = await GalleryItem.find<GalleryItemType>(
        {
          parentGalleryId: galleryToDeleteId,
          owner: authSessionUser.dbUserId,
        },
        null,
        { session }
      );

      // Delete blobs for UserAssetGalleryItems
      for (const item of galleryItemsToDelete) {
        if (isUserAssetGalleryItem(item)) {
          const media = item.media;
          const userId = item.owner.toString();
          
          try {
            // If video media, delete video and thumbnail blobs
            if (isUserMedia(media)) {
              if (media.mediaCdn.type === CdnIdType.VERCEL_BLOB_USER_VIDEO) {
                const mediaCdnId = media.mediaCdn.cdnId;
                const blobKey = makeUserVideoBlobKey(
                  userId,
                  UploadCategory.UPLOADED_VIDEO,
                  mediaCdnId
                );
                await del(blobKey);

                const thumbnailCdnId = media.imageCdn.cdnId;
                const thumbnailBlobKey = makeUserImageBlobKey(
                  userId,
                  UploadCategory.UPLOADED_THUMBNAIL,
                  thumbnailCdnId
                );
                await del(thumbnailBlobKey);
              }
            } else if (isUserImage(media)) {
              if (media.imageCdn.type === CdnIdType.VERCEL_BLOB_USER_IMAGE) {
                const cdnId = media.imageCdn.cdnId;
                const blobKey = makeUserImageBlobKey(
                  userId,
                  UploadCategory.UPLOADED_IMAGE,
                  cdnId
                );
                await del(blobKey);
              }
            }
          } catch (blobError) {
            // Log error but continue deleting other items
            console.error(`Failed to delete blob for gallery item ${item._id}:`, blobError);
          }
        }
      }

      // Now delete all gallery items from the database
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
