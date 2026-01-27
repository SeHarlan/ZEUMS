import { PUBLIC_MEDIA_ROUTE } from "@/constants/serverRoutes";
import { UserAssetEntry } from "@/types/entry";
import { GalleryMediaItem } from "@/types/galleryItem";
import { handleClientError } from "@/utils/handleError";
import axios from "axios";
import useSWRImmutable from "swr/immutable";

const userAssetFetcher = async (assetId: string) => {
  if (!assetId) return null;

  return axios
    .get<{ asset: UserAssetEntry | GalleryMediaItem }>(PUBLIC_MEDIA_ROUTE(assetId))
    .then((res) => {
      return res.data.asset;
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
