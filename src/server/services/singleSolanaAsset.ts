import { GetAssetResponse } from "@/types/helius";
import axios from "axios";

type GetSingleAssetResponse = {
  result: GetAssetResponse;
};

export const getSingleSolanaAsset = async (mintAddress: string): Promise<GetAssetResponse> => {
  const heliusUrl = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;

  const params = {
    jsonrpc: "2.0",
    id: `zeumz-single-${mintAddress}`,
    method: "getAsset",
    params: {
      id: mintAddress,
      displayOptions: {
        showUnverifiedCollections: true,
        showCollectionMetadata: true,
      },
    },
  };

  const response = await axios
    .post<GetSingleAssetResponse>(heliusUrl, params)
    .then((res) => {
      return res.data.result;
    });

  if (!response) {
    throw new Error(`Failed to fetch asset with mint address: ${mintAddress}`);
  }

  return response;
};
