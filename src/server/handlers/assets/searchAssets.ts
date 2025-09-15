import { NextRequest, NextResponse } from "next/server";
import { standardErrorResponses } from "@/utils/server";

export async function searchAssetsHandler(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // TODO: Implement actual search logic here
    // For now, return empty array as requested
    const searchResults: unknown[] = [];

    return NextResponse.json(searchResults, { status: 200 });
  
  } catch (error) { 
    return standardErrorResponses({
      error,
      location: "handlers-searchAssets",
      report: true,
    }); 
  }
}