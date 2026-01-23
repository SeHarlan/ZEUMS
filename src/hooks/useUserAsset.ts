import { PUBLIC_MEDIA_ROUTE } from "@/constants/serverRoutes";
import { UserAssetEntry } from "@/types/entry";
import { handleClientError } from "@/utils/handleError";
import { parseEntryDate } from "@/utils/timeline";
import axios from "axios";
import useSWRImmutable from "swr/immutable";

const userAssetFetcher = async (assetId: string) => {
  if (!assetId) return null;

  return axios
    .get<{ entry: UserAssetEntry }>(PUBLIC_MEDIA_ROUTE(assetId))
    .then((res) => {
      // Parse the date in case it comes as a string
      return parseEntryDate(res.data.entry);
    })
};

const useUserAsset = (assetId: string | null | undefined) => {
  // Immutable so we only fetch once
  const { data, error, isLoading, mutate } = useSWRImmutable(
    assetId ? `user-asset-${assetId}` : null,
    () => userAssetFetcher(assetId!),
    {
      onError: (err) => {
        handleClientError({
          error: err,
          location: "userAssetFetcher",
        });
      }
    }
  );

  return {
    userAsset: data,
    isLoading,
    isError: error,
    mutateUserAsset: mutate,
  };
};

export default useUserAsset;
