import { FC, ReactNode, useEffect, useMemo } from "react";
import Pagination from "../general/Pagination"
import useSolanaAssets from "@/hooks/useSolanaAssets";
import { useUser } from "@/context/UserProvider";
import { getWalletsByChain } from "@/utils/user";
import { EntrySource } from "@/types/entry";
import { Separator } from "../ui/separator";
import { cn } from "@/utils/ui-utils";
import { P } from "../typography/Typography";
import { useDebouncedState } from "@/hooks/useDebounce";
import { ScrollArea } from "../ui/scroll-area";
import { SearchIcon } from "lucide-react";

import { PrefixInput } from "../ui/input";
import AssetThumbnailCard from "./AssetThumbnailCard";
import { ParsedBlockChainAsset } from "@/types/asset";
import LoadingSpinner from "../general/LoadingSpinner";

interface SolanaAssetSelectProps {
  disabledAssetAddresses?: string[]; //prevent already saved tokens from being selected again
  source: EntrySource;
  selectedAssets: ParsedBlockChainAsset[] | null;
  setSelectAssets: (assets: ParsedBlockChainAsset[]) => void;
  perPage?: number;
  /** @defaults 1 */
  maxSelected?: number;
  withSearch?: boolean; // Optional prop to enable/disable search
  maxSelectWarningBody?: ReactNode; // Optional prop for custom max select warning body
}

const SolanaAssetSelect: FC<SolanaAssetSelectProps> = ({
  source,
  selectedAssets,
  setSelectAssets,
  perPage = 20, // Default to 20 if not provided
  maxSelected = 1, // Default to 1 if not provided
  withSearch, // Default to true to show search input
  maxSelectWarningBody,
}) => {
  const [page, debouncedPage, setPage] = useDebouncedState(0, 200);
  const [search, debouncedSearch, setSearch] = useDebouncedState("", 300);

  const { user } = useUser()  

  const {solanaPublicKeys} = useMemo(() => getWalletsByChain(user), [user]);

  const { solanaAssets, isLoading } = useSolanaAssets({
    publicKeys: solanaPublicKeys,
    source,
  });

  const filteredAssets = useMemo(() => {
    if (!solanaAssets || solanaAssets.length === 0) return [];  
    // No search term, return all assets
    if (!debouncedSearch) return solanaAssets;

    return solanaAssets.filter(asset =>
      asset.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      asset.tokenAddress.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [solanaAssets, debouncedSearch]);

  const assetsPage = useMemo(() => {
    return (
      filteredAssets?.slice(
        debouncedPage * perPage,
        (debouncedPage + 1) * perPage
      ) || []
    );
  }, [filteredAssets, debouncedPage, perPage]);

  const totalItems = filteredAssets?.length || 0;

  const selectedAddresses = useMemo(() => {
    return selectedAssets?.map(asset => asset.tokenAddress);
  }, [selectedAssets])

  const isSingleSelect = maxSelected === 1;
  const maxSelectReached = selectedAssets && selectedAssets?.length >= maxSelected;

  const showMaxSelectWarning = !isSingleSelect && maxSelectReached;

  useEffect(() => {
    if (debouncedSearch) {
      setPage(0); // Reset page to 0 when search term changes
    }
  }, [debouncedSearch, setPage]);

  const mergeAspectRatio = (asset: ParsedBlockChainAsset, aspectRatio: number) => {
    return {
      ...asset,
      media: {
        ...asset.media,
        aspectRatio,
      },
    };
  }

  const handleAssetClick = ({
    asset,
    isSelected,
    aspectRatio,
  }: {
    asset: ParsedBlockChainAsset;
    isSelected: boolean;
    aspectRatio: number;
  }) => {
    console.log("🚀 ~ handleAssetClick ~ aspectRatio:", aspectRatio)
    if (isSingleSelect) {
      // If single select, always replace the selected asset
      setSelectAssets([mergeAspectRatio(asset, aspectRatio)]);
      return;
    }

    if (isSelected) {
      //delete from list
      setSelectAssets(
        selectedAssets?.filter((a) => a.tokenAddress !== asset.tokenAddress) ||
          []
      );
    } else {
      if (selectedAssets && selectedAssets?.length >= maxSelected) {
        return;
      }
      setSelectAssets([...(selectedAssets || []), mergeAspectRatio(asset, aspectRatio)]);
    }
  };
  return (
    <div className="h-full flex flex-col gap-4">
      {withSearch ? (
        <PrefixInput
          wrapperClassName="max-w-sm"
          icon={<SearchIcon className="max-w-4 max-h-4" />}
          placeholder="Search assets"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      ) : null}
      <ScrollArea className="flex-1 min-h-0 pr-3">
        {showMaxSelectWarning ? (
          <div className="absolute top-1/2 left-1/2 -translate-1/2 bg-popover-blur z-10 rounded-md p-6 shadow-md">
            <P className="text-lg font-bold">
              You can only add up to {maxSelected} assets at a time.
            </P>
            {maxSelectWarningBody}
          </div>
        ) : null}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 h-full">
          {assetsPage.map((asset) => {
            const isSelected = !!selectedAddresses?.includes(
              asset.tokenAddress
            );

            return (
              <AssetThumbnailCard
                key={asset.tokenAddress}
                asset={asset}
                
                onClick={(aspectRatio) => handleAssetClick({ asset, isSelected, aspectRatio })}
                className={cn(
                  "cursor-pointer border-3 hover:shadow-md transition-shadow duration-300",
                  isSelected ? "border-primary" : "border-transparent",
                  showMaxSelectWarning && !isSelected
                    ? "opacity-50 cursor-default"
                    : ""
                )}
              />
            );
          })}
        </div>
      </ScrollArea>

      {assetsPage.length === 0 ? (
        <div className="w-full h-full flex items-center justify-center">
          {isLoading ? (
            <LoadingSpinner iconClass="min-w-12 min-h-12" />
          ) : (
            <P className="text-muted-foreground text-center">No assets found</P>
          )}
        </div>
      ) : null}

      <Separator />

      <Pagination
        page={page}
        setPage={setPage}
        perPage={perPage}
        totalItems={totalItems}
      />
    </div>
  );
}

export default SolanaAssetSelect;


