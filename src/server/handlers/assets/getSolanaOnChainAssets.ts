import { parseHeliusAssets } from "@/server/services/helpers/parseHeliusAssets";
import { parseMallowAssets } from "@/server/services/helpers/parseMallowAssets";
import { getSolanaAssetsPage } from "@/server/services/solanaAssets";
import { GetSolanaAssetsPageProps, GetSolanaAssetsPageResponse } from "@/types/asset";
import { EntrySource } from "@/types/entry";
import { standardErrorResponses } from "@/utils/server";
import { NextRequest, NextResponse } from "next/server";
import { fetchFromMallow } from "./searchAssets";

export async function getSolanaOnChainAssetsHandler(req: NextRequest): Promise<NextResponse>{  
  try {
    const props = (await req
      .text()
      .then((data) => JSON.parse(data))) as GetSolanaAssetsPageProps  ;

    if (!props) { 
      return NextResponse.json(null, { status: 204 });
    }

    if (props.searchTerm) {
      const sourceAddress = props.source === EntrySource.Collector
        ? { ownerAddresses: [props.publicKey] }
        : { artistAddresses: [props.publicKey] };
      
      const { result: rawAssets, total } = await fetchFromMallow({
        search: props.searchTerm,
        page: props.page,
        ...sourceAddress,
      });
      const {parsedAssets, duplicateEditionCount} = parseMallowAssets(rawAssets);

      const assetSearchResponse: GetSolanaAssetsPageResponse = {
        parsedAssets,
        skippedAssets: [],
        total: parsedAssets.length + duplicateEditionCount,
        grandTotal: total,
        duplicateEditionCount
      }
      return NextResponse.json(assetSearchResponse, { status: 200 });
    }

    //else get all with pages
    //page and limit are also available if needed
    const {items, total, grand_total } = await getSolanaAssetsPage(props);


    const {parsedAssets, skippedAssets, duplicateEditionCount} = parseHeliusAssets(items);
    
    const assetPageResponse: GetSolanaAssetsPageResponse = {
      parsedAssets,
      skippedAssets,
      total,
      grandTotal: grand_total,
      duplicateEditionCount
    }
    return NextResponse.json(assetPageResponse, { status: 200 });
  
  } catch (error) { 
    return standardErrorResponses({
      error,
      location: "handlers-getSolanaOnChainAssets",
      report: true,
    }); 
  }
}
