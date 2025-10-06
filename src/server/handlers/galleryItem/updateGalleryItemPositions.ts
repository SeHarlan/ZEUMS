import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../db/mongodb";
import { getAuthSessionUser, standardErrorResponses } from "@/utils/server";
import { GalleryItemPositionUpdate } from "@/types/galleryItem";
import GalleryItem from "@/server/models/Gallery/GalleryItem";


export async function updateGalleryItemPositionsHandler(
  req: NextRequest
): Promise<NextResponse> {
  await connectToDatabase();

  try {
    const authSessionUser = await getAuthSessionUser(req);

    const positionsToUpdate = (await req.json()) as GalleryItemPositionUpdate[];

    if (!Array.isArray(positionsToUpdate) || positionsToUpdate.length === 0) {
      throw new Error("Invalid positions data");
    }
    
    // Use bulkWrite for efficient batch updates
    const bulkOps = positionsToUpdate.map((update) => ({
      updateOne: {
        filter: {
          _id: update._id,
          owner: authSessionUser.dbUserId,
        },
        update: {
          $set: { position: update.position },
        }
      },
    }));

    const bulkWriteResult = await GalleryItem.bulkWrite(bulkOps, {
      ordered: false, // Continue even if some operations fail
    });

    return NextResponse.json({ bulkWriteResult });
  } catch (error) {
    return standardErrorResponses({
      error,
      location: "handlers-updateGalleryItemPositions",
      report: true,
    });
  }
}
