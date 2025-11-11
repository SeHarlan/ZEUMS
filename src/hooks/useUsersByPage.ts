import useSWR from "swr";
import { handleClientError } from "@/utils/handleError";
import axios from "axios";
import { PUBLIC_USER_ROUTE } from "@/constants/serverRoutes";
import { PublicListUserType } from "@/types/user";
import { PaginatedResponse, PaginationParams } from "@/types/generic";

const usersByPageFetcher = async (params: PaginationParams) => {
  const { page = 1, limit = 16 } = params;
  
  const searchParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  return axios
    .get<PaginatedResponse<PublicListUserType>>(`${PUBLIC_USER_ROUTE}?${searchParams}`)
    .then((res) => res.data)
    .catch((err) => {
      handleClientError({
        error: err,
        location: "usersByPageFetcher",
      });
      return null;
    });
};

const useUsersByPage = (params: PaginationParams) => {
  const { page = 1, limit = 16 } = params;
  
  const { data, error, isLoading, mutate } = useSWR(
    `users-page-${page}-limit-${limit}`,
    () => usersByPageFetcher({ page, limit })
  );

  return {
    users: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    isError: error,
    mutateUsers: mutate,
  };
};

export default useUsersByPage;
