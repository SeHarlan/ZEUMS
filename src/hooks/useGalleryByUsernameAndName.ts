import { GALLERY_BY_USERNAME_AND_NAME_ROUTE } from "@/constants/serverRoutes";
import { PublicGalleryType } from "@/types/gallery";
import { handleClientError } from "@/utils/handleError";
import axios from "axios";
import useSWR from "swr";

const galleryByUsernameAndNameFetcher = async (username: string, galleryName: string) => {
  if (!username || !galleryName) return null;

  return axios
    .get<{ gallery: PublicGalleryType }>(GALLERY_BY_USERNAME_AND_NAME_ROUTE(username, galleryName))
    .then((res) => {
      return res.data.gallery;
    })
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
  console.log("🚀 ~ useGalleryByUsernameAndName ~ error:", error)

  return {
    gallery: data,
    isLoading,
    isError: error,
    mutateGallery: mutate,
  };
};

export default useGalleryByUsernameAndName;
