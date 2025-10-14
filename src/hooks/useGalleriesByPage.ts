import useSWR from "swr";
import { handleClientError } from "@/utils/handleError";
import axios from "axios";
import { PUBLIC_GALLERY_ROUTE } from "@/constants/serverRoutes";
import { PublicGalleryType } from "@/types/gallery";
import { PaginatedResponse, PaginationParams } from "@/types/generic";

const galleriesByPageFetcher = async (params: PaginationParams) => {
  const { page = 1, limit = 16 } = params;
  
  const searchParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  return axios
    .get<PaginatedResponse<PublicGalleryType>>(
      `${PUBLIC_GALLERY_ROUTE}?${searchParams}`
    )
    .then((res) => res.data)
    .catch((err) => {
      handleClientError({
        error: err,
        location: "galleriesByPageFetcher",
      });
      return null;
    });
};

const useGalleriesByPage = (params: PaginationParams) => {
  const { data, error, isLoading, mutate } = useSWR(
    `galleries-${params.page}-${params.limit}`,
    () => galleriesByPageFetcher(params)
  );

  return {
    galleries: data?.data,
    pagination: data?.pagination,
    isLoading,
    isError: error,
    mutateGalleries: mutate,
  };
};

export default useGalleriesByPage;
