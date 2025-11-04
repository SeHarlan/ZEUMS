import { SEARCH_PARAM, SEARCH_RANDOMIZE_KEY } from "@/constants/serverRoutes";
import { parseMallowAssets } from "@/server/services/helpers/parseMallowAssets";
import { MallowExploreRequest, MallowExploreResponse } from "@/types/mallow";
import { standardErrorResponses } from "@/utils/server";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const LIMIT = 12;
export async function searchAssetsHandler(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get(SEARCH_PARAM);

    if (!query || query.trim().length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    const useRandom = query === SEARCH_RANDOMIZE_KEY

    const { result: rawAssets } = useRandom
      ? await fetchRandomFromMallow(1)
      : await fetchFromMallow({ search: query, page: 0 });
    
    const { parsedAssets } = parseMallowAssets(rawAssets);
    
    const randomIndex = Math.floor(Math.random() * parsedAssets.length);
    const limitedAssets = useRandom
      ? parsedAssets.slice(randomIndex, randomIndex + 1  )
      : parsedAssets.slice(0, LIMIT);

    const total = useRandom ? 1 : parsedAssets.length;

    return NextResponse.json({searchResults: limitedAssets, total }, { status: 200 });
  } catch (error) { 
    return standardErrorResponses({
      error,
      location: "handlers-searchAssets",
      report: true,
    }); 
  }
}

interface FetchFromMallowProps {
  search: string;
  /** starts at 0 */
  page: number;
  artistAddresses?: string[];
  ownerAddresses?: string[];
}
export const fetchFromMallow = async ({
  search,
  page,
  artistAddresses,
  ownerAddresses,
}: FetchFromMallowProps) => {
  // Call Mallow API
  const mallowRequest: MallowExploreRequest = {
    page,
    filter: {
      search: search.trim(),
      artists: artistAddresses,
      collectors: ownerAddresses,
    },
    sort: "recently-listed",
  };

  return axios
    .post<MallowExploreResponse>(
      "https://api.mallow.art/v1/artworks/explore",
      mallowRequest,
      {
        headers: {
          Accept: "application/json",
          "X-Api-Key": `${process.env.MALLOW_API_KEY}`,
        },
      }
    )
    .then((res) => res.data);
};


const fetchRandomFromMallow = async (count: number): Promise<MallowExploreResponse> => { 
  if (count > 3) { 
    return { result: [], total: 0, nextPage: 0 };
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

  const result = await fetchFromMallow({ search: characters, page: 0 });
  const assets = result.result;

  //make sure there's at least one non tezos asset
  if (!assets.length || !assets.some(asset => asset.source !== "objkt")) {
    return await fetchRandomFromMallow(count + 1);
  }
  
  return result;
}