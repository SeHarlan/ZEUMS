import { GetSolanaAssetsProps } from "@/types/asset";
import { EntrySource } from "@/types/entry";
import { GetAssetResponseList, GetAssetResponse as AssetResponse } from "@/types/helius";
import axios from "axios";

type GetAssetResponse = {
  result: GetAssetResponseList;
};

export const getAllSolanaAssets = async ({ publicKeys, source }: GetSolanaAssetsProps) => {
  const assets: AssetResponse[] = [];

  const maxBatch = 1000
  const heliusUrl = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;

  const method =
    source === EntrySource.Collector
      ? "getAssetsByOwner"
      : "getAssetsByCreator";
  
  const sourceParamKey =
    source === EntrySource.Collector
      ? "ownerAddress" : "creatorAddress";

  for (const publicKey of publicKeys) {
    let page = 1 // Starts at 1
    let continueFetching = true;
    while (continueFetching) {

      const params = {
        jsonrpc: "2.0",
        id: `zeumz-${publicKey}-${page}`,
        method,
        params: {
          [sourceParamKey]: publicKey,
          page: page,
          limit: maxBatch,
          displayOptions: {
            showUnverifiedCollections: true,
            // showCollectionMetadata: true,
          },
          // sortBy: {
          //   sortBy: "created",
          //   sortDirection: "desc",
          // }
        },
      };

      const res = await axios
        .post<GetAssetResponse>(heliusUrl, params)
        .then((res) => {
          return res.data.result;
        })
            
      if (!res || res.items.length == 0) {
        continueFetching = false
        break;
      } else {
        assets.push(...res.items)
        page++;
      }
    }
  }
  return assets;
}

