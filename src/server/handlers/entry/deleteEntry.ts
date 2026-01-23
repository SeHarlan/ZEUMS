import { UploadCategory } from "@/constants/uploadCategories";
import { isUserAssetEntry, TimelineEntry } from "@/types/entry";
import { CdnIdType } from "@/types/media";
import { makeUserImageBlobKey } from "@/utils/clientImageUpload";
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
      
      if (entryToDelete.media.imageCdn.type !== CdnIdType.VERCEL_BLOB_USER_IMAGE) {
        throw new Error("Only VERCEL_BLOB_USER_IMAGE entries can be deleted");
      }

      const media = entryToDelete.media;
      if (media?.imageCdn?.cdnId) {
        const cdnId = media.imageCdn.cdnId;
        const userId = entryToDelete.owner.toString();
        
        // Reconstruct blob key using makeUserImageBlobKey
        const blobKey = makeUserImageBlobKey(
          userId,
          UploadCategory.UPLOADED_IMAGE,
          cdnId
        );

        await del(blobKey);
        //let error be thrown if it fails
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
