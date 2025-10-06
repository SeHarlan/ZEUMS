import useSWRImmutable from "swr/immutable";
import { handleClientError } from "@/utils/handleError";
import axios from "axios";
import { ASSETS_SOLANA_ROUTE } from "@/constants/serverRoutes";
import { GetSolanaAssetsProps, ParsedBlockChainAsset } from "@/types/asset";

const solanaAssetFetcher = async (props: GetSolanaAssetsProps) => {
  if (!props.publicKeys?.length) return [];
  console.time("solanaAssetFetcher");
  return axios
    .post<ParsedBlockChainAsset[]>(ASSETS_SOLANA_ROUTE, props)
    .then((res) => res.data)
    .catch((err) => {
      handleClientError({
        error: err,
        location: "solanaAssetFetcher",
      });
      return [];
    });
};

const useSolanaAssets = (solanaFetcherprops: GetSolanaAssetsProps) => {
  //Immutable so we only fetch once (and save on Helius API credits)
  const { data, error, isLoading, mutate } = useSWRImmutable(
    solanaFetcherprops,
    (p) => solanaAssetFetcher(p)
  );

  return {
    solanaAssets: data,
    isLoading,
    isError: error,
    mutateSolanaAssets: mutate,
  };
};

export default useSolanaAssets;
