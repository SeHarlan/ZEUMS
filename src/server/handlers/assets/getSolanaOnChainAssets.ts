import { parseSolanaAssets } from "@/server/services/helpers/parseSolanaAssets";
import { getAllSolanaAssets } from "@/server/services/solanaAssets";
import { GetSolanaAssetsProps } from "@/types/asset";
import { standardErrorResponses } from "@/utils/server";
import { NextRequest, NextResponse } from "next/server";

export async function getSolanaOnChainAssetsHandler(req: NextRequest): Promise<NextResponse>{  
  try {
    const { publicKeys, source } = (await req
      .text()
      .then((data) => JSON.parse(data))) as GetSolanaAssetsProps;

    if (!publicKeys?.length) { 
      return NextResponse.json([], { status: 204 });
    }
    const rawAssets = await getAllSolanaAssets({
      publicKeys: publicKeys,
      source: source,
    });

    const parsedAssets = parseSolanaAssets(rawAssets);
    
    return NextResponse.json(parsedAssets, { status: 200 });
  
  } catch (error) { 
    return standardErrorResponses({
      error,
      location: "handlers-getSolanaOnChainAssets",
      report: true,
    }); 
  }
}
