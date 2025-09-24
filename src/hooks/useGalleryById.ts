import useSWR from "swr";
import { handleClientError } from "@/utils/handleError";
import axios from "axios";
import { GALLERY_BY_ID_ROUTE } from "@/constants/serverRoutes";
import { GalleryType } from "@/types/gallery";

const galleryByIdFetcher = async (galleryId: string) => {
  if (!galleryId) return null;

  return axios
    .get<{ gallery: GalleryType }>(GALLERY_BY_ID_ROUTE(galleryId))
    .then((res) => {
      return res.data.gallery;
    })
    .catch((err) => {
      handleClientError({
        error: err,
        location: "galleryByIdFetcher",
      });
      return null;
    });
};

const useGalleryById = (galleryId: string | null | undefined) => {
  const { data, error, isLoading, mutate } = useSWR(
    galleryId ? `gallery-${galleryId}` : null,
    () => galleryByIdFetcher(galleryId!)
  );

  return {
    gallery: data,
    isLoading,
    isError: error,
    mutateGallery: mutate,
  };
};

export default useGalleryById;
