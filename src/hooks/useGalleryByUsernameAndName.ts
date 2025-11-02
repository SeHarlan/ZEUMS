import useSWR from "swr";
import { handleClientError } from "@/utils/handleError";
import axios from "axios";
import { PublicGalleryType } from "@/types/gallery";

const galleryByUsernameAndNameFetcher = async (username: string, galleryname: string) => {
  if (!username || !galleryname) return null;

  return axios
    .get<{ gallery: PublicGalleryType }>(`/api/public/gallery/${username}/${galleryname}`)
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
  galleryname: string | null | undefined
) => {
  const { data, error, isLoading, mutate } = useSWR(
    username && galleryname ? `gallery-${username}-${galleryname}` : null,
    () => galleryByUsernameAndNameFetcher(username!, galleryname!)
  );

  return {
    gallery: data,
    isLoading,
    isError: error,
    mutateGallery: mutate,
  };
};

export default useGalleryByUsernameAndName;
