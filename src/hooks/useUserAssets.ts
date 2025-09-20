import useSWR from "swr";
import axios from "axios";
import { TimelineEntry } from "@/types/entry";
import { handleClientError } from "@/utils/handleError";

const USER_ASSETS_ROUTE = "/api/entry/entries";

// Fetcher function for SWR
const userAssetsFetcher = async (url: string) => {
  const response = await axios.get(url);
  return response.data.entries;
};

// Hook for fetching user assets (both blockchain and user assets)
export const useUserAssets = () => {
  const { data, error, isLoading, mutate } = useSWR<TimelineEntry[]>(
    USER_ASSETS_ROUTE,
    userAssetsFetcher,
    {
      onError: (error: any) => {
        handleClientError({
          error,
          location: "useUserAssets",
        });
      },
    }
  );

  // Filter for asset entries only (blockchain and user assets)
  const assetEntries = data?.filter((entry: TimelineEntry) => 
    entry.entryType === "blockchain_asset" || entry.entryType === "user_asset"
  ) || [];

  return {
    userAssets: assetEntries,
    allEntries: data || [],
    isLoading,
    isError: error,
    mutateUserAssets: mutate,
  };
};

// Hook for searching user assets
export const useSearchUserAssets = (searchTerm: string) => {
  const { userAssets, isLoading, isError } = useUserAssets();
  
  const filteredAssets = userAssets.filter((asset: TimelineEntry) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    // Search in title
    if (asset.title?.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // Search in description
    if (asset.description?.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // For blockchain assets, search in collection name or attributes
    if (asset.entryType === "blockchain_asset") {
      // You might want to add collection name to the asset type
      // For now, we'll search in attributes
      const hasMatchingAttribute = asset.attributes?.some((attr: any) => 
        attr.value.toLowerCase().includes(searchLower)
      );
      if (hasMatchingAttribute) return true;
    }
    
    return false;
  });

  return {
    filteredAssets,
    isLoading,
    isError,
  };
};