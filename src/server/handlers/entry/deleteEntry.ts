import { UploadCategory } from "@/constants/uploadCategories";
import { isUserAssetEntry, TimelineEntry } from "@/types/entry";
import { CdnIdType, isUserImage, isUserMedia } from "@/types/media";
import { makeUserImageBlobKey, makeUserVideoBlobKey } from "@/utils/clientImageUpload";
import { getAuthSessionUser, standardErrorResponses } from "@/utils/server";
import { del } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../db/mongodb";
import Entry from "../../models/Entry/Entry";

export async function deleteEntryHandler(
  req: NextRequest
): Promise<NextResponse> {
  await connectToDatabase();

  try {
    const authSessionUser = await getAuthSessionUser(req);

    // Get the id from query parameters
    const { searchParams } = new URL(req.url);
    const entryToDeleteId = searchParams.get('id');

    if (!entryToDeleteId) {
      throw new Error("Entry ID is required");
    }

    // Fetch the entry first to check if it's a UserAssetEntry and get blob info
    const entryToDelete = await Entry.findOne<TimelineEntry>({
      _id: entryToDeleteId,
      owner: authSessionUser.dbUserId,
    });

    if (!entryToDelete) {
      throw new Error("Entry not found or you don't have permission to delete it");
    }
    
    // If it's a UserAssetEntry, delete the blob first
    if (isUserAssetEntry(entryToDelete)) {
      const media = entryToDelete.media;
      const userId = entryToDelete.owner.toString();
      
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
        console.error(`Failed to delete blob for entry ${entryToDelete._id}:`, blobError);
      }

    }

    // Now delete the entry
    const deleteResult = await Entry.deleteOne({
      _id: entryToDeleteId,
      owner: authSessionUser.dbUserId,
    });

    if (!deleteResult.acknowledged || deleteResult.deletedCount === 0) {
      throw new Error("Entry not found or failed to delete");
    }

    return NextResponse.json(deleteResult);
  } catch (error) {
    return standardErrorResponses({
      error,
      location: "handlers-deleteEntry",
      report: true,
    });
  }
}
