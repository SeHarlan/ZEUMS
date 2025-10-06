import { parseSolanaAssets } from "@/server/services/helpers/parseSolanaAssets";
import { getAllSolanaAssets } from "@/server/services/solanaAssets";
import { GetSolanaAssetsProps } from "@/types/asset";
import { standardErrorResponses } from "@/utils/server";
import { NextRequest, NextResponse } from "next/server";

export async function getSolanaOnChainAssetsHandler(req: NextRequest): Promise<NextResponse>{  
  try {
    console.time("getSolanaOnChainAssetsHandler");
    const { publicKeys, source } = (await req
      .text()
      .then((data) => JSON.parse(data))) as GetSolanaAssetsProps;

    if (!publicKeys?.length) { 
      return NextResponse.json([], { status: 204 });
    }
    console.time("getSolanaOnChainAssets");
    const rawAssets = await getAllSolanaAssets({
      publicKeys: publicKeys,
      source: source,
    });
    console.timeEnd("getSolanaOnChainAssets");

    console.time("parseSolanaAssets");
    const parsedAssets = parseSolanaAssets(rawAssets);

    console.timeEnd("parseSolanaAssets");
    console.timeEnd("getSolanaOnChainAssetsHandler");
    
    return NextResponse.json(parsedAssets, { status: 200 });
  
  } catch (error) { 
    return standardErrorResponses({
      error,
      location: "handlers-getSolanaOnChainAssets",
      report: true,
    }); 
  }
}
