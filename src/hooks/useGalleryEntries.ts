import useSWRMutation from "swr/mutation";
import axios from "axios";
import { handleClientError } from "@/utils/handleError";

const GALLERY_ENTRY_ROUTE = "/api/gallery-entry";

// Mutation function for creating gallery entries
const createGalleryEntryMutation = async (url: string, { arg }: { arg: any }) => {
  const response = await axios.post(url, arg);
  return response.data.galleryEntry;
};

// Hook for creating gallery entries
export const useCreateGalleryEntry = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    GALLERY_ENTRY_ROUTE,
    createGalleryEntryMutation,
    {
      onError: (error: any) => {
        handleClientError({
          error,
          location: "useCreateGalleryEntry",
        });
      },
    }
  );

  return {
    createGalleryEntry: trigger,
    isCreating: isMutating,
    createError: error,
  };
};