import { NextRequest, NextResponse } from "next/server";
import { standardErrorResponses } from "@/utils/server";
import axios from "axios";
import { parseMallowAssets } from "@/server/services/helpers/parseMallowAssets";
import { MallowExploreRequest, MallowExploreResponse } from "@/types/mallow";

// Placeholder API key - replace with actual key from environment variables
const MALLOW_API_KEY = process.env.MALLOW_API_KEY || "placeholder-api-key";

export async function searchAssetsHandler(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // Call Mallow API
    const mallowRequest: MallowExploreRequest = {
      filter: {
        search: query.trim(),
      },
      limit: 10, // Limit to 10 results as requested
    };

    const response = await axios.post<MallowExploreResponse>(
      "https://api.mallow.art/v1/artworks/explore",
      mallowRequest,
      {
        headers: {
          "Authorization": `Bearer ${MALLOW_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Parse the Mallow response into our internal format
    const rawAssets = response.data.artworks || [];
    const searchResults = parseMallowAssets(rawAssets);

    return NextResponse.json(searchResults, { status: 200 });
  
  } catch (error) { 
    console.error("Mallow API error:", error);
    return standardErrorResponses({
      error,
      location: "handlers-searchAssets",
      report: true,
    }); 
  }
}