import { GetSolanaAssetsPageProps, GetSolanaAssetsProps } from "@/types/asset";
import { EntrySource } from "@/types/entry";
import { GetAssetResponse as AssetResponse, GetAssetResponseList } from "@/types/helius";
import axios from "axios";

type GetAssetResponse = {
  result: GetAssetResponseList;
};

const heliusUrl = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;
const MAX_BATCH = 1000

const getMethod = (source: EntrySource) => {
  return source === EntrySource.Collector
    ? "getAssetsByOwner"
    : "getAssetsByCreator";
}
const getSourceParamKey = (source: EntrySource) => {
  return source === EntrySource.Collector
    ? "ownerAddress" : "creatorAddress";
}

export const getAllSolanaAssets = async ({ publicKeys, source }: GetSolanaAssetsProps) => {
  const assets: AssetResponse[] = [];

  const maxBatch = MAX_BATCH

  const method = getMethod(source)
  
  const sourceParamKey = getSourceParamKey(source)


  for (const publicKey of publicKeys) {

    let page = 1 // Starts at 1
    let continueFetching = true;
    while (continueFetching) {
      const params = {
        jsonrpc: "2.0",
        id: `zeums-all-${publicKey}-${page}`,
        method,
        params: {
          [sourceParamKey]: publicKey,
          page: page,
          limit: maxBatch,
          options: {
            showUnverifiedCollections: true,
            // showCollectionMetadata: true,
          },
          
          sortBy: {
            sortBy: "created",
            sortDirection: "desc",
          }
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

export const getSolanaAssetsPage = async ({
  publicKey,
  source,
  page,
  limit,
}: GetSolanaAssetsPageProps) => {
  const method = getMethod(source);
  const sourceParamKey = getSourceParamKey(source);

  const id = `z-${publicKey}-${source}-${page}-${limit ?? MAX_BATCH}`;
  const params = {
    jsonrpc: "2.0",
    id,
    method,
    params: {
      [sourceParamKey]: publicKey,
      page: page + 1, // Helius API pages starts at 1
      limit: limit || MAX_BATCH,
      displayOptions: {
        showUnverifiedCollections: true,
        // showCollectionMetadata: true,
        showGrandTotal: page === 0,
      },

      sortBy: {
        sortBy: "created",
        sortDirection: "desc",
      },
    },
  };

  return axios
  .post<GetAssetResponse>(heliusUrl, params)
  .then((res) => {
      return res.data.result;
    })
};
    
