import useSWRImmutable from "swr/immutable";
import { handleClientError } from "@/utils/handleError";
import axios from "axios";
import { PUBLIC_MEDIA_ROUTE } from "@/constants/serverRoutes";
import { UserAssetEntry } from "@/types/entry";
import { parseEntryDate } from "@/utils/timeline";

const userAssetFetcher = async (assetId: string) => {
  if (!assetId) return null;

  return axios
    .get<{ entry: UserAssetEntry }>(PUBLIC_MEDIA_ROUTE(assetId))
    .then((res) => {
      // Parse the date in case it comes as a string
      return parseEntryDate(res.data.entry);
    })
    .catch((err) => {
      handleClientError({
        error: err,
        location: "userAssetFetcher",
      });
      return null;
    });
};

const useUserAsset = (assetId: string | null | undefined) => {
  // Immutable so we only fetch once
  const { data, error, isLoading, mutate } = useSWRImmutable(
    assetId ? `user-asset-${assetId}` : null,
    () => userAssetFetcher(assetId!)
  );

  return {
    userAsset: data,
    isLoading,
    isError: error,
    mutateUserAsset: mutate,
  };
};

export default useUserAsset;
