import useSWRImmutable from "swr/immutable";
import { handleClientError } from "@/utils/handleError";
import axios from "axios";
import { SINGLE_ASSET_SOLANA_ROUTE } from "@/constants/serverRoutes";
import { ParsedBlockChainAsset } from "@/types/asset";

const singleSolanaAssetFetcher = async (mintAddress: string) => {
  if (!mintAddress) return null;

  return axios
    .get<{ asset: ParsedBlockChainAsset }>(SINGLE_ASSET_SOLANA_ROUTE(mintAddress))
    .then((res) => res.data.asset)
    .catch((err) => {
      handleClientError({
        error: err,
        location: "singleSolanaAssetFetcher",
      });
      return null;
    });
};

const useSolanaAsset = (mintAddress: string | null | undefined) => {
  // Immutable so we only fetch once (and save on Helius API credits)
  const { data, error, isLoading, mutate } = useSWRImmutable(
    mintAddress ? `solana-asset-${mintAddress}` : null,
    () => singleSolanaAssetFetcher(mintAddress!)
  );

  return {
    solanaAsset: data,
    isLoading,
    isError: error,
    mutateSolanaAsset: mutate,
  };
};

export default useSolanaAsset;
