import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../db/mongodb";
import User from "../../models/User";
import { PublicListUserType } from "@/types/user";
import { standardErrorResponses } from "@/utils/server";
import { PaginatedResponse } from "@/types/generic";
import { ENTRY_FOREIGN_KEY } from "@/constants/databaseKeys";



export async function getUsersWithTimelinesHandler(req: NextRequest): Promise<NextResponse> {
  try {
    await connectToDatabase();

    // Parse pagination parameters from query string
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '16')));

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Use aggregation pipeline to find users with timelines that have at least 1 entry
    const pipeline = [
      // Lookup entries for each user
      {
        $lookup: {
          from: 'entries', // Collection name for entries
          localField: '_id',
          foreignField: ENTRY_FOREIGN_KEY,
          as: 'timelineEntries'
        }
      },
      // Filter users who have at least one timeline entry and both profile and banner images
      {
        $match: {
          'timelineEntries.0': { $exists: true },
          'profileImage': { $exists: true, $ne: null, $nin: ['', null] },
          'bannerImage': { $exists: true, $ne: null, $nin: ['', null] }
        }
      },
      // Sort by user creation date (descending - most recent users first)
      {
        $sort: {
          createdAt: -1 as const
        }
      },
      // Skip and limit for pagination
      {
        $skip: skip
      },
      {
        $limit: limit
      },
      // Project only the fields we need for public users
      {
        $project: {
          _id: 1,
          username: 1,
          displayName: 1,
          profileImage: 1,
          bannerImage: 1
        }
      }
    ];

    // Execute aggregation pipeline
    const users: PublicListUserType[] = await User.aggregate(pipeline);

    // Get total count for pagination metadata
    const totalCountPipeline = [
      {
        $lookup: {
          from: 'entries',
          localField: '_id',
          foreignField: ENTRY_FOREIGN_KEY,
          as: 'timelineEntries'
        }
      },
      {
        $match: {
          'timelineEntries.0': { $exists: true },
          'profileImage': { $exists: true, $ne: null, $nin: ['', null] },
          'bannerImage': { $exists: true, $ne: null, $nin: ['', null] }
        }
      },
      {
        $count: 'total'
      }
    ];

    const totalCountResult = await User.aggregate(totalCountPipeline);
    const total = totalCountResult[0]?.total || 0;

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    // Create paginated response
    const response: PaginatedResponse<PublicListUserType> = {
      data: users,
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
      location: "handlers-getUsersWithTimelines",
      report: true,
    });
  }
}
