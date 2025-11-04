import { useUser } from "@/context/UserProvider";
import { useDebouncedState } from "@/hooks/useDebounce";
import useSolanaAssets from "@/hooks/useSolanaAssets";
import { EntrySource, isEntrySource } from "@/types/entry";
import { cn, truncate } from "@/utils/ui-utils";
import { getWalletsByChain } from "@/utils/user";
import { SearchIcon, WalletIcon } from "lucide-react";
import { Dispatch, FC, ReactNode, SetStateAction, useEffect, useMemo, useState } from "react";
import Pagination from "../general/Pagination";
import { P } from "../typography/Typography";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";

import { EDIT_PROFILE_ACCOUNT } from "@/constants/clientRoutes";
import { ParsedBlockChainAsset, SkippedAssetReason } from "@/types/asset";
import { ImageVariant } from "@/types/media";
import { ChainIdsEnum } from "@/types/wallet";

import LoadingSpinner from "../general/LoadingSpinner";
import { Button, LinkButton } from "../ui/button";
import { PrefixInput } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import AssetThumbnailCard from "./AssetThumbnailCard";

interface SolanaAssetSelectProps {
  usedAssetAddresses?: Set<string>; //prevent already saved tokens from being selected again
  source: EntrySource | "choose";
  selectedAssets: ParsedBlockChainAsset[] | null;
  setSelectAssets: Dispatch<SetStateAction<ParsedBlockChainAsset[]>>;
  optimisticallySelectedAssets: Set<string>;
  setOptimisticallySelectedAssets: Dispatch<SetStateAction<Set<string>>>;
  /** @defaults 20 */
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
  perPage = 20,
  /** Default to 1 if not provided */
  maxSelected = 1,
  withSearch, // Default to true to show search input
  maxSelectWarningBody,
  imageVariant = "default",
  usedAssetAddresses,
  optimisticallySelectedAssets,
  setOptimisticallySelectedAssets,
}) => {
  const [page, debouncedPage, setPage] = useDebouncedState(0, 200);
  const [search, debouncedSearch, setSearch] = useDebouncedState("", 200);
  const [selectedSource, setSelectedSource] = useState<EntrySource>(
    EntrySource.Collector
  );
  const { user } = useUser();

  const solanaPublicKeys = useMemo(
    () => getWalletsByChain(user)[ChainIdsEnum.SOLANA],
    [user]
  );

  const [activePublicKey, setActivePublicKey] = useState(solanaPublicKeys[0]);

  const addWalletPath = EDIT_PROFILE_ACCOUNT 

  const {
    solanaAssets: solanaAssetsPage,
    skippedAssets,
    isLoading,
    grandTotal,
    isError,
    duplicateEditionCount
  } = useSolanaAssets({
    publicKey: activePublicKey,
    source: source === "choose" ? selectedSource : source,
    limit: perPage,
    page: debouncedPage,
    searchTerm: debouncedSearch,
  });

  //mallow search api is set at 30 per page
  const actualPerPage = !!search ? 30 : perPage;

  
  // Calculate spam count by subtraction
  const parseSkipped = () => {
    const collectionNfts = [];
    const spamNfts = [];
    const brokenContentNfts = [];
    if (skippedAssets) {
      for (const asset of skippedAssets) {
        if (asset.reason === SkippedAssetReason.COLLECTION_NFT) {
          collectionNfts.push(asset);
        } else if (asset.reason === SkippedAssetReason.LIKELY_SPAM) {
          spamNfts.push(asset);
        } else if (asset.reason === SkippedAssetReason.BROKEN_CONTENT) {
          brokenContentNfts.push(asset);
        }
      }
    }
    return { collectionNfts, spamNfts, brokenContentNfts };
  }

  const { collectionNfts, spamNfts, brokenContentNfts } = parseSkipped();
  const skippedCount = collectionNfts.length + spamNfts.length + duplicateEditionCount + brokenContentNfts.length;

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
  }, [debouncedSearch, setPage, activePublicKey]);

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
        (prev) =>
          prev?.filter((a) => a.tokenAddress !== asset.tokenAddress) || []
      );
    } else {
      setSelectAssets((prev) => {
        if (prev && prev?.length >= maxSelected) {
          return prev;
        }
        return [...(prev || []), mergeAspectRatio(asset, aspectRatio)];
      });
    }
  };

  const handleOptimisticClick = (assetId: string, isSelected: boolean) => {
    setOptimisticallySelectedAssets((prev) => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(assetId);
      } else {
        newSet.delete(assetId);
      }
      return newSet;
    });
  };

  const renderFeedback = () => {
    if (isLoading) {
      return <LoadingSpinner iconClass="size-14" />;
    }

    if (solanaAssetsPage === null || isError) {
      return (
        <div className="flex flex-col items-center justify-center gap-4">
          <P className="text-muted-foreground text-center">
            You'll need to add a verified wallet to use this feature
          </P>
          <LinkButton href={addWalletPath}>
            <WalletIcon />
            Add wallet
          </LinkButton>
        </div>
      );
    }

    return <P className="text-muted-foreground text-center">No assets found</P>;
  };

  return (
    <div className="h-full flex flex-col gap-2">
      <div className="grid lg:grid-cols-2 gap-x-4 gap-y-2 place-items-end px-2">
        <div className="w-full">
          <P className="text-sm text-muted-foreground">Active Wallet</P>
          <Select value={activePublicKey} onValueChange={setActivePublicKey}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a wallet" />
            </SelectTrigger>
            <SelectContent>
              {solanaPublicKeys.map((publicKey) => (
                <SelectItem key={publicKey} value={publicKey}>
                  {truncate(publicKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {withSearch ? (
          <PrefixInput
            icon={<SearchIcon className="size-4 text-muted-foreground" />}
            placeholder="Search assets"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        ) : (
          <div />
        )}
      </div>
      {source === "choose" ? (
        <Tabs
          onValueChange={(value) =>
            isEntrySource(value) && setSelectedSource(value)
          }
          value={selectedSource}
        >
          <TabsList className="w-full font-serif">
            <TabsTrigger primaryActive value={EntrySource.Collector}>
              Collected
            </TabsTrigger>
            <TabsTrigger primaryActive value={EntrySource.Creator}>
              Created
            </TabsTrigger>
          </TabsList>
        </Tabs>
      ) : null}
      <ScrollArea className="flex-1 min-h-0">
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
            "grid gap-4 h-full p-2",
            imageVariant === "banner"
              ? "grid-cols-1 lg:grid-cols-2"
              : "grid-cols-2 lg:grid-cols-4"
          )}
        >
          {solanaAssetsPage?.map((asset) => {
            const isSelected = !!selectedAddresses?.includes(
              asset.tokenAddress
            );
            const isOptimisticallySelected = optimisticallySelectedAssets.has(
              asset.tokenAddress
            );

            const isUsed = usedAssetAddresses?.has(asset.tokenAddress);

            const isDisabled = (showMaxSelectWarning && !isSelected) || isUsed;

            if (isUsed) {
              return (
                <Tooltip key={asset.tokenAddress}>
                  <TooltipTrigger disabled={!isUsed}>
                    <AssetThumbnailCard
                      asset={asset}
                      imageVariant={imageVariant}
                      className={cn("border-3 opacity-50")}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <P>This asset is already being used</P>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return (
              <AssetThumbnailCard
                key={asset.tokenAddress}
                asset={asset}
                imageVariant={imageVariant}
                onClick={(aspectRatio) => {
                  if (isDisabled) return;
                  handleAssetClick({ asset, isSelected, aspectRatio });
                }}
                optimisticClick={isOptimisticallySelected}
                setOptimisticClick={(click) => {
                  if (isDisabled) return;
                  handleOptimisticClick(asset.tokenAddress, click);
                }}
                className={cn(
                  "cursor-pointer border-3 hover:shadow-md transition-shadow duration-200",
                  isSelected
                    ? "border-primary"
                    : isOptimisticallySelected
                    ? "border-primary/90"
                    : "border-transparent",
                  isDisabled
                    ? "opacity-50 cursor-default pointer-events-none"
                    : ""
                )}
              />
            );
          })}
        </div>
        {skippedCount > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <P className="text-muted-foreground text-center w-full p-4 underline cursor-pointer">
                {skippedCount} {skippedCount === 1 ? "item" : "items"} hidden
              </P>
            </PopoverTrigger>
            <PopoverContent className="text-sm">
              {duplicateEditionCount > 0 && (
                <P>{duplicateEditionCount} duplicate editions hidden.</P>
              )}
              {collectionNfts.length > 0 && (
                <div>
                  <P>{collectionNfts.length} Collection NFTs hidden:</P>
                  <P className="text-muted-foreground">
                    {collectionNfts?.map((asset) => asset.title).join(", ")}
                  </P>
                </div>
              )}
              {spamNfts.length > 0 && (
                <div>
                  <P>{spamNfts.length} likely spam hidden:</P>
                  <P className="text-muted-foreground">
                    {spamNfts?.map((asset) => asset.title).join(", ")}
                  </P>
                </div>
              )}
              {brokenContentNfts.length > 0 && (
                <P>
                  {brokenContentNfts.length} assets with broken content hidden.
                </P>
              )}
            </PopoverContent>
          </Popover>
        )}
      </ScrollArea>

      {!solanaAssetsPage?.length ? (
        <div className="w-full h-full flex items-center justify-center">
          {renderFeedback()}
        </div>
      ) : null}

      <Separator />
      <div className="flex justify-between flex-wrap-reverse gap-2 items-center">
        {maxSelected > 1 ? (
          <Button
            onClick={handleClear}
            variant={"outline"}
            className="w-full lg:w-fit"
          >
            Clear
          </Button>
        ) : null}
        <Pagination
          page={page}
          setPage={setPage}
          perPage={actualPerPage}
          totalItems={grandTotal}
        />
        {maxSelected > 1 ? (
          <Button variant={"outline"} className="invisible hidden lg:block" >
            Clear
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export default SolanaAssetSelect;


