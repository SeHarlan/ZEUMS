import { GALLERY_BY_USERNAME_AND_NAME_ROUTE } from "@/constants/serverRoutes";
import { PublicGalleryType } from "@/types/gallery";
import { BaseUserType } from "@/types/user";
import { handleClientError } from "@/utils/handleError";
import axios from "axios";
import useSWR from "swr";

export type OwnerTimelineSettingsType = Pick<
  BaseUserType,
  "_id" | "backgroundImage" | "backgroundTileCount" | "backgroundTintHex" | "backgroundTintOpacity" | "backgroundBlur" | "timelineTheme" | "timelineHeadingFont" | "timelineBodyFont"
>;

interface GalleryByUsernameAndNameResponse {
  gallery: PublicGalleryType;
  ownerTimelineSettings: OwnerTimelineSettingsType | null;
}

const galleryByUsernameAndNameFetcher = async (
  username: string,
  galleryName: string
): Promise<GalleryByUsernameAndNameResponse | null> => {
  if (!username || !galleryName) return null;

  return axios
    .get<GalleryByUsernameAndNameResponse>(GALLERY_BY_USERNAME_AND_NAME_ROUTE(username, galleryName))
    .then((res) => res.data)
    .catch((err) => {
      handleClientError({
        error: err,
        location: "galleryByUsernameAndNameFetcher",
      });
      return null;
    });
};

const useGalleryByUsernameAndName = (
  username: string | null | undefined,
  galleryName: string | null | undefined
) => {
  const { data, error, isLoading, mutate } = useSWR(
    username && galleryName ? `gallery-${username}-${galleryName}` : null,
    () => galleryByUsernameAndNameFetcher(username!, galleryName!)
  );

  return {
    gallery: data?.gallery ?? null,
    ownerTimelineSettings: data?.ownerTimelineSettings ?? null,
    isLoading,
    isError: error,
    mutateGallery: mutate,
  };
};

export default useGalleryByUsernameAndName;
