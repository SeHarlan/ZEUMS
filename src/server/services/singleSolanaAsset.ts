import { GetAssetResponse as AssetResponse } from "@/types/helius";
import axios from "axios";

type GetSingleAssetResponse = {
  result: AssetResponse;
};

export const getSingleSolanaAsset = async (mintAddress: string): Promise<AssetResponse | null> => {
  const heliusUrl = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;

  const params = {
    jsonrpc: "2.0",
    id: `zeumz-single-${mintAddress}`,
    method: "getAsset",
    params: {
      id: mintAddress,
      displayOptions: {
        showUnverifiedCollections: true,
      },
    },
  };

  try {
    const res = await axios
      .post<GetSingleAssetResponse>(heliusUrl, params)
      .then((res) => {
        return res.data.result;
      });
    
    return res || null;
  } catch (error) {
    console.error(`Error fetching asset for mint ${mintAddress}:`, error);
    return null;
  }
};