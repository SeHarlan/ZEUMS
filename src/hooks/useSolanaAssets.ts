import { ASSETS_SOLANA_ROUTE } from "@/constants/serverRoutes";
import { GetSolanaAssetsPageProps, GetSolanaAssetsPageResponse } from "@/types/asset";
import { handleClientError } from "@/utils/handleError";
import axios from "axios";
import { useEffect, useState } from "react";
import useSWRImmutable from "swr/immutable";

const solanaAssetFetcher = async (props: GetSolanaAssetsPageProps) => {
  if (!props.publicKey) return null
  return axios
    .post<GetSolanaAssetsPageResponse>(ASSETS_SOLANA_ROUTE, props)
    .then((res) => res.data)
    .catch((err) => {
      handleClientError({
        error: err,
        location: "solanaAssetFetcher",
      });
      return null;
    });
};

const useSolanaAssets = (solanaFetcherProps: GetSolanaAssetsPageProps) => {
  //Immutable so we only fetch once (and save on Helius API credits)
  const { data, error, isLoading, mutate } = useSWRImmutable(
    solanaFetcherProps,
    (p) => solanaAssetFetcher(p)
  );
  const [grandTotal, setGrandTotal] = useState(0);

  useEffect(() => {
    //grand total is only fetched on the first page to optimize further fetching
    //set in state so its remembered for later pages
    if (data?.grandTotal !== undefined) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGrandTotal(data.grandTotal);
    }
  }, [data, solanaFetcherProps.publicKey]);

  const solanaAssets = data?.parsedAssets || null
  const skippedAssets = data?.skippedAssets || null
  const total = data?.total || 0
  const duplicateEditionCount = data?.duplicateEditionCount || 0

  return {
    solanaAssets,
    skippedAssets,
    total,
    grandTotal,
    duplicateEditionCount,
    isLoading,
    isError: !!error,
    mutateSolanaAssets: mutate,
  };
};

export default useSolanaAssets;
