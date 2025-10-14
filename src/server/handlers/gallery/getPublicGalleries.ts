import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../db/mongodb";
import Gallery from "../../models/Gallery/Gallery";
import { standardErrorResponses } from "@/utils/server";
import { PaginatedResponse } from "@/types/generic";
import { PublicGalleryType } from "@/types/gallery";
import { PipelineStage } from "mongoose";
import { 
  GALLERY_ITEMS_VIRTUAL,
  GALLERY_ITEMS_FOREIGN_KEY,
  GALLERY_OWNER_DATA_FOREIGN_KEY,
  GALLERY_OWNER_FOREIGN_KEY,
} from "@/constants/databaseKeys";
import { GalleryItemTypes } from "@/types/galleryItem";

export async function getPublicGalleriesHandler(req: NextRequest): Promise<NextResponse> {
  try {
    await connectToDatabase();

    // Parse pagination parameters from query string
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '16')));

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Create aggregation pipeline
    const pipeline: PipelineStage[] = [
      // Lookup owner data first
      {
        $lookup: {
          from: "users",
          localField: GALLERY_OWNER_FOREIGN_KEY,
          foreignField: "_id",
          as: GALLERY_OWNER_DATA_FOREIGN_KEY,
          pipeline: [
            {
              $project: {
                username: 1,
                displayName: 1,
                profileImage: 1
              }
            }
          ]
        }
      },
      // Unwind ownerData to get single object instead of array
      {
        $unwind: `$${GALLERY_OWNER_DATA_FOREIGN_KEY}`
      },
      // Lookup gallery items
      {
        $lookup: {
          from: "galleryitems", // This is the actual collection name for GalleryItem model
          localField: "_id",
          foreignField: GALLERY_ITEMS_FOREIGN_KEY,
          as: GALLERY_ITEMS_VIRTUAL,
          pipeline: [
            {
              $match: {
                itemType: { 
                  $in: [GalleryItemTypes.BlockchainAsset, GalleryItemTypes.UserAsset] 
                }
              }
            },
            {
              $sort: { "position.1": 1, "position.0": 1 }
            },
            {
              $limit: 1
            }
          ]
        }
      },
      // Filter out galleries that don't have any media items after lookup
      {
        $match: {
          [`${GALLERY_ITEMS_VIRTUAL}.0`]: { $exists: true }
        }
      },
      // Sort by creation date (most recent first)
      {
        $sort: { createdAt: -1 }
      }
    ];

    // Execute aggregation with pagination
    const [result] = await Gallery.aggregate([
      ...pipeline,
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit }
          ],
          totalCount: [
            { $count: "count" }
          ]
        }
      }
    ]);

    const galleries = result.data;
    const total = result.totalCount[0]?.count || 0;

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    // Create paginated response
    const response: PaginatedResponse<PublicGalleryType> = {
      data: galleries,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    return standardErrorResponses({
      error,
      location: "handlers-getPublicGalleries",
      report: true,
    });
  }
}
