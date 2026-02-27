import { UploadCategory } from "@/constants/uploadCategories";
import { isUserAssetGalleryItem, GalleryItem } from "@/types/galleryItem";
import { CdnIdType, isUserImage, isUserMedia } from "@/types/media";
import { makeUserImageBlobKey, makeUserVideoBlobKey } from "@/utils/clientImageUpload";
import { getAuthSessionUser, standardErrorResponses } from "@/utils/server";
import { del } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../db/mongodb";
import GalleryItemModel from "../../models/Gallery/GalleryItem";

export async function deleteGalleryItemHandler(
  req: NextRequest
): Promise<NextResponse> {
  await connectToDatabase();

  try {
    const authSessionUser = await getAuthSessionUser(req);

    // Get the id from query parameters
    const { searchParams } = new URL(req.url);
    const galleryItemToDeleteId = searchParams.get('id');

    if (!galleryItemToDeleteId) {
      throw new Error("Gallery item ID is required");
    }

    // Fetch the gallery item first to check if it's a UserAssetGalleryItem and get blob info
    const galleryItemToDelete = await GalleryItemModel.findOne<GalleryItem>({
      _id: galleryItemToDeleteId,
      owner: authSessionUser.dbUserId,
    });

    if (!galleryItemToDelete) {
      throw new Error("Gallery item not found or you don't have permission to delete it");
    }

    // If it's a UserAssetGalleryItem, delete the blob first
    if (isUserAssetGalleryItem(galleryItemToDelete)) {
      const media = galleryItemToDelete.media;
      const userId = galleryItemToDelete.owner.toString();
      
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

            // Reconstruct blob key using makeUserImageBlobKey
            const blobKey = makeUserImageBlobKey(
              userId,
              UploadCategory.UPLOADED_IMAGE,
              cdnId
            );

            await del(blobKey);
          }
        }
      } catch (blobError) {
        // Log error but continue with database deletion
        console.error(`Failed to delete blob for gallery item ${galleryItemToDelete._id}:`, blobError);
      }
    }

    // Now delete the gallery item
    const deleteResult = await GalleryItemModel.deleteOne({
      _id: galleryItemToDeleteId,
      owner: authSessionUser.dbUserId,
    });

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
