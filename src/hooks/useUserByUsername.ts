import useSWR from "swr";
import { handleClientError } from "@/utils/handleError";
import axios from "axios";
import { PUBLIC_USER_BY_USERNAME_ROUTE } from "@/constants/serverRoutes";
import { PublicUserType } from "@/types/user";
import { parseEntryDates } from "@/utils/timeline";

const userByUsernameFetcher = async (username: string) => {
  if (!username) return null;

  return axios
    .get<{ user: PublicUserType }>(PUBLIC_USER_BY_USERNAME_ROUTE(username))
    .then((res) => {
      res.data.user.createdTimelineEntries = parseEntryDates(res.data.user.createdTimelineEntries);
      res.data.user.collectedTimelineEntries = parseEntryDates(res.data.user.collectedTimelineEntries);
      return res.data.user;
    })
    .catch((err) => {
      handleClientError({
        error: err,
        location: "userByUsernameFetcher",
      });
      return null;
    });
};

const useUserByUsername = (username: string | null | undefined) => {
  const { data, error, isLoading, mutate } = useSWR(
    username ? `user-${username}` : null,
    () => userByUsernameFetcher(username!)
  );

  return {
    user: data,
    isLoading,
    isError: error,
    mutateUser: mutate,
  };
};

export default useUserByUsername;
