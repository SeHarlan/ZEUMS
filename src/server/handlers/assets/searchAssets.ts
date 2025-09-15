import { NextRequest, NextResponse } from "next/server";
import { standardErrorResponses } from "@/utils/server";
import axios from "axios";
import { parseMallowAssets } from "@/server/services/helpers/parseMallowAssets";
import { MallowExploreRequest, MallowExploreResponse } from "@/types/mallow";
import { SEARCH_PARAM, SEARCH_RANDOMIZE_KEY } from "@/constants/serverRoutes";

const LIMIT = 12;
export async function searchAssetsHandler(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get(SEARCH_PARAM);

    if (!query || query.trim().length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    const useRandom = query === SEARCH_RANDOMIZE_KEY

    const response = useRandom ? await fetchRandomFromMallow(1) : await fetchFromMallow(query);

    // Parse the Mallow response into our internal format
    const rawAssets = response || [];
    
    const parsedResults = parseMallowAssets(rawAssets);
    
    const randomIndex = Math.floor(Math.random() * parsedResults.length);
    const limitedResults = useRandom
      ? parsedResults.slice(randomIndex, randomIndex + 1  )
      : parsedResults.slice(0, LIMIT);

    const total = useRandom ? 1 : parsedResults.length;

    return NextResponse.json({searchResults: limitedResults, total }, { status: 200 });
  } catch (error) { 
    return standardErrorResponses({
      error,
      location: "handlers-searchAssets",
      report: true,
    }); 
  }
}

const fetchFromMallow = async (query: string) => {
  // Call Mallow API
  const mallowRequest: MallowExploreRequest = {
    page: 0,
    filter: {
      search: query.trim(),
    },
    sort: "recently-listed",
  };

  return axios.post<MallowExploreResponse>(
    "https://api.mallow.art/v1/artworks/explore",
    mallowRequest,
    {
      headers: {
        Accept: "application/json",
        "X-Api-Key": `${process.env.MALLOW_API_KEY}`,
      },
    }
  ).then((res) => res.data.result);
}


const fetchRandomFromMallow = async (count: number) => { 
  if (count > 3) { 
    return [];
  }
  //generate 2 random characters with 9:1 letter to number ratio
  const characters = Array.from({ length: 2 }, () => {
    // 90% chance for letter, 10% chance for number
    if (Math.random() < 0.9) {
      return String.fromCharCode(97 + Math.floor(Math.random() * 26));
    } else {
      return String.fromCharCode(48 + Math.floor(Math.random() * 10));
    }
  }).join('');

  const response = await fetchFromMallow(characters);

  //make sure there's at least one non tezos asset
  if (!response.length || !response.some(asset => asset.source !== "objkt")) {
    return await fetchRandomFromMallow(count + 1);
  }
  
  return response;
}