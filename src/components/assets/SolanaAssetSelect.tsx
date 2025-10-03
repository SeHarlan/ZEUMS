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
import { SearchIcon, WalletIcon } from "lucide-react";

import { PrefixInput } from "../ui/input";
import AssetThumbnailCard from "./AssetThumbnailCard";
import { ParsedBlockChainAsset } from "@/types/asset";
import LoadingSpinner from "../general/LoadingSpinner";
import { ChainIdsEnum } from "@/types/wallet";
import { ImageVariant } from "@/types/media";
import { Button, LinkButton } from "../ui/button";
import { EDIT_PROFILE_ACCOUNT } from "@/constants/clientRoutes";

interface SolanaAssetSelectProps {
  usedAssetAddresses?: Set<string>; //prevent already saved tokens from being selected again
  source: EntrySource;
  selectedAssets: ParsedBlockChainAsset[] | null;
  setSelectAssets: (assets: ParsedBlockChainAsset[]) => void;
  optimisticallySelectedAssets: Set<string>;
  setOptimisticallySelectedAssets: (assets: Set<string>) => void;
  perPage?: number;
  /** @defaults 1 */
  maxSelected?: number;
  withSearch?: boolean; // Optional prop to enable/disable search
  maxSelectWarningBody?: ReactNode; // Optional prop for custom max select warning body
  imageVariant?: ImageVariant;
}

const SolanaAssetSelect: FC<SolanaAssetSelectProps> = ({
  source,
  selectedAssets,
  setSelectAssets,
  perPage = 12, // Default to 20 if not provided
  maxSelected = 1, // Default to 1 if not provided
  withSearch, // Default to true to show search input
  maxSelectWarningBody,
  imageVariant = "default",
  usedAssetAddresses,
  optimisticallySelectedAssets,
  setOptimisticallySelectedAssets,
}) => {
  const [page, debouncedPage, setPage] = useDebouncedState(0, 200);
  const [search, debouncedSearch, setSearch] = useDebouncedState("", 200);

  const { user } = useUser();

  const solanaPublicKeys = useMemo(
    () => getWalletsByChain(user)[ChainIdsEnum.SOLANA],
    [user]
  );

  const { solanaAssets, isLoading } = useSolanaAssets({
    publicKeys: solanaPublicKeys,
    source,
  });

  const filteredAssets = useMemo(() => {
    if (!solanaAssets || solanaAssets.length === 0) return [];
    // No search term, return all assets
    if (!debouncedSearch) return solanaAssets;

    return solanaAssets.filter(
      (asset) =>
        asset.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        asset.tokenAddress
          .toLowerCase()
          .includes(debouncedSearch.toLowerCase()) ||
        asset.collection?.name
          ?.toLowerCase()
          .includes(debouncedSearch.toLowerCase())
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
    return selectedAssets?.map((asset) => asset.tokenAddress);
  }, [selectedAssets]);

  const isSingleSelect = maxSelected === 1;
  const maxSelectReached =
    selectedAssets && selectedAssets?.length >= maxSelected;

  const showMaxSelectWarning = !isSingleSelect && maxSelectReached;

  useEffect(() => {
    if (debouncedSearch) {
      setPage(0); // Reset page to 0 when search term changes
    }
  }, [debouncedSearch, setPage]);

  const handleClear = () => {
    setSelectAssets([]);
    setOptimisticallySelectedAssets(new Set()); 
    setSearch("");
  };

  const mergeAspectRatio = (
    asset: ParsedBlockChainAsset,
    aspectRatio: number
  ) => {
    return {
      ...asset,
      media: {
        ...asset.media,
        aspectRatio,
      },
    };
  };

  const handleAssetClick = ({
    asset,
    isSelected,
    aspectRatio,
  }: {
    asset: ParsedBlockChainAsset;
    isSelected: boolean;
    aspectRatio: number;
  }) => {
    if (isSingleSelect) {
      // If single select, always replace the selected asset
      setSelectAssets([mergeAspectRatio(asset, aspectRatio)]);
      return;
    }

    if (isSelected) {
      //delete from list
      setSelectAssets(
        selectedAssets?.filter((a) => a.tokenAddress !== asset.tokenAddress) || []
      );
    } else {
      if (selectedAssets && selectedAssets?.length >= maxSelected) {
        return;
      }
      setSelectAssets([
        ...(selectedAssets || []),
        mergeAspectRatio(asset, aspectRatio),
      ]);
    }
  };

  const handleOptimisticClick = (assetId: string, isSelected: boolean) => {
    const newSet = new Set(optimisticallySelectedAssets);
    if (isSelected) {
      newSet.add(assetId);
    } else {
      newSet.delete(assetId);
    }
    setOptimisticallySelectedAssets(newSet);
  };

  const renderFeedback = () => {
    if (isLoading) {
      return <LoadingSpinner iconClass="size-14" />;
    }

    if (!solanaAssets?.length) {
      return (
        <div className="flex flex-col items-center justify-center gap-4">
          <P className="text-muted-foreground text-center">
            No verified wallet found
          </P>
          <LinkButton href={EDIT_PROFILE_ACCOUNT}>
            <WalletIcon />
            Add wallet
          </LinkButton>
        </div>
      );
    }

    return <P className="text-muted-foreground text-center">No assets found</P>;
  };
  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex justify-between flex-wrap gap-2">
        {withSearch ? (
          <PrefixInput
            wrapperClassName="sm:max-w-sm"
            icon={<SearchIcon className="size-4 text-muted-foreground" />}
            placeholder="Search assets"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        ) : null}
        {maxSelected > 1 ? (
          <Button
            onClick={handleClear}
            variant={"outline"}
            className="w-full sm:w-fit"
          >
            Clear
          </Button>
        ) : null}
      </div>
      <ScrollArea className="flex-1 min-h-0 pr-3">
        {showMaxSelectWarning ? (
          <div className="absolute top-1/2 left-1/2 -translate-1/2 bg-popover-blur z-10 rounded-md p-6 shadow-md">
            <P className="text-lg font-bold">
              You can add a max of {maxSelected} assets at a time.
            </P>
            {maxSelectWarningBody}
          </div>
        ) : null}

        <div
          className={cn(
            "grid gap-4 h-full py-2",
            imageVariant === "banner"
              ? "grid-cols-1 lg:grid-cols-2"
              : "grid-cols-2 lg:grid-cols-4"
          )}
        >
          {assetsPage.map((asset) => {
            const isSelected = !!selectedAddresses?.includes(
              asset.tokenAddress
            );
            const isOptimisticallySelected = optimisticallySelectedAssets.has(asset.tokenAddress);

            const isUsed = usedAssetAddresses?.has(
              asset.tokenAddress
            );

            const isDisabled = (showMaxSelectWarning && !isSelected) || isUsed;

            return (
              <AssetThumbnailCard
                key={asset.tokenAddress}
                asset={asset}
                imageVariant={imageVariant}
                onClick={(aspectRatio) => {
                  if (isDisabled) return;
                  handleAssetClick({ asset, isSelected, aspectRatio })
                }}
                optimisticClick={isOptimisticallySelected}
                setOptimisticClick={(click) => handleOptimisticClick(asset.tokenAddress, click)}
                className={cn(
                  "cursor-pointer border-3 hover:shadow-md transition-shadow duration-200",
                  isSelected
                    ? "border-primary"
                    : isOptimisticallySelected
                      ? "border-primary/90"
                      : "border-transparent",
                  isDisabled
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
          {renderFeedback()}
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
};

export default SolanaAssetSelect;


