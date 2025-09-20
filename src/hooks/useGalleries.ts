import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import axios from "axios";
import { GalleryType } from "@/types/gallery";
import { handleClientError } from "@/utils/handleError";

const GALLERY_ROUTE = "/api/gallery";

// Fetcher function for SWR
const galleriesFetcher = async (url: string) => {
  const response = await axios.get(url);
  return response.data.galleries;
};

// Mutation functions for SWR
const createGalleryMutation = async (url: string, { arg }: { arg: any }) => {
  const response = await axios.post(url, arg);
  return response.data.gallery;
};

const updateGalleryMutation = async (url: string, { arg }: { arg: { id: string; data: any } }) => {
  const response = await axios.put(`${url}/${arg.id}`, arg.data);
  return response.data.gallery;
};

const deleteGalleryMutation = async (url: string, { arg }: { arg: string }) => {
  await axios.delete(`${url}/${arg}`);
  return arg;
};

// Hook for fetching galleries
export const useGalleries = () => {
  const { data, error, isLoading, mutate } = useSWR<GalleryType[]>(
    GALLERY_ROUTE,
    galleriesFetcher,
    {
      onError: (error: any) => {
        handleClientError({
          error,
          location: "useGalleries",
        });
      },
    }
  );

  return {
    galleries: data || [],
    isLoading,
    isError: error,
    mutateGalleries: mutate,
  };
};

// Hook for creating galleries
export const useCreateGallery = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    GALLERY_ROUTE,
    createGalleryMutation,
    {
      onError: (error: any) => {
        handleClientError({
          error,
          location: "useCreateGallery",
        });
      },
    }
  );

  return {
    createGallery: trigger,
    isCreating: isMutating,
    createError: error,
  };
};

// Hook for updating galleries
export const useUpdateGallery = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    GALLERY_ROUTE,
    updateGalleryMutation,
    {
      onError: (error: any) => {
        handleClientError({
          error,
          location: "useUpdateGallery",
        });
      },
    }
  );

  return {
    updateGallery: trigger,
    isUpdating: isMutating,
    updateError: error,
  };
};

// Hook for deleting galleries
export const useDeleteGallery = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    GALLERY_ROUTE,
    deleteGalleryMutation,
    {
      onError: (error: any) => {
        handleClientError({
          error,
          location: "useDeleteGallery",
        });
      },
    }
  );

  return {
    deleteGallery: trigger,
    isDeleting: isMutating,
    deleteError: error,
  };
};