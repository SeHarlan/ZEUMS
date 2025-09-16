"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PrefixInput } from "@/components/ui/input";
import { GiftIcon, SearchIcon } from "lucide-react";
import { BLOCKCHAIN_MEDIA_PATHS } from "@/constants/clientRoutes";
import { ChainIdsEnum } from "@/types/wallet";
import axios from "axios";
import { ParsedBlockChainAsset } from "@/types/asset";
import AssetThumbnailCard from "./AssetThumbnailCard";
import { handleServerError } from "@/utils/handleError";
import { SEARCH_ASSETS_ROUTE, SEARCH_PARAM, SEARCH_RANDOMIZE_KEY } from "@/constants/serverRoutes";
import { cn } from "@/utils/ui-utils";
import ScrollableDialog from "../general/ScrollableDialog";
import { P } from "../typography/Typography";
import { isValidSolanaAddress } from "@/utils/asset";
import Link from "next/link";
import { MallowIcon } from "../icons/Social";
import { getReturnKey, makeReturnQueryParam } from "@/utils/navigation";

interface SearchAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SearchAssetDialog: React.FC<SearchAssetDialogProps> = ({ open, onOpenChange }) => {
  const [searchInput, setSearchInput] = useState("");
  const [error, setError] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ParsedBlockChainAsset[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [total, setTotal] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  const resetSearch = () => { 
    setSearchResults([]);
    setHasSearched(false);
    setTotal(0);
  }

  const handleSearch = (search?: string) => {
    const searchTerm = search || searchInput.trim();

    if (!searchTerm) {
      setError("Please enter a search term");
      return;
    }

    if (isValidSolanaAddress(searchTerm)) {
      handleAssetClick(searchTerm);
      return;
    }

    setSearching(true);
    setError("");

    // Call the API route to search for blockchain assets by name
    axios
      .get<{ searchResults: ParsedBlockChainAsset[]; total: number }>(
        `${SEARCH_ASSETS_ROUTE}?${SEARCH_PARAM}=${encodeURIComponent(
          searchTerm
        )}`
      )
      .then((response) => {
        setSearchResults(response.data.searchResults);
        setTotal(response.data.total);
        setHasSearched(true);
        setTotal(response.data.total);
      })
      .catch((error) => {
        handleServerError({
          error,
          location: "SearchAssetDialog_handleSearch",
        });
        setError("Failed to search for assets. Please try again.");
        resetSearch();
      })
      .finally(() => {
        setSearching(false);
      });
  };

  const handleRandomAsset = () => {
    // setSearchInput(SEARCH_RANDOMIZE_KEY);
    handleSearch(SEARCH_RANDOMIZE_KEY);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleAssetClick = (tokenAddress: string) => {
    // Navigate to the asset page when clicked
    router.push(BLOCKCHAIN_MEDIA_PATHS[ChainIdsEnum.SOLANA](tokenAddress) + makeReturnQueryParam(getReturnKey(pathname)));
    
    setTimeout(() => {
      onOpenChange(false)
      resetSearch()
    }, 1000);
  };

  return (
    <ScrollableDialog
      open={open}
      onOpenChange={onOpenChange}
      trigger={null}
      title="Search Solana Blockchain Assets"
      wrapperClassName="bg-popover-blur sm:max-w-2xl"
    >
      <div className="space-y-1">
        <PrefixInput
          wrapperClassName="bg-background"
          icon={<SearchIcon className="size-4 text-muted-foreground" />}
          placeholder="Search for assets by name or exact mint address"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        {error && (
          <p className="text-sm text-destructive bg-background/33 rounded-sm px-2 w-fit">
            {error}
          </p>
        )}
        <P className="text-sm mt-2 mb-2 sm:mb-0 ">
          <MallowIcon className="mr-2 mb-1 size-6 inline " />
          Search engine powered by{" "}
          <Link href="https://mallow.art" className="underline font-serif">
            mallow.art
          </Link>
        </P>
      </div>
      <div className="flex justify-between items-start flex-wrap-reverse gap-2">
        <div className="w-full sm:w-auto">
          {searchResults.length && total > searchResults.length ? (
            <P className="text-sm text-muted-foreground">
              Showing the most recent {searchResults.length} assets...
            </P>
          ) : null}
        </div>

        <div className="flex gap-2 flex-wrap-reverse w-full sm:w-auto">
          <Button
            onClick={handleRandomAsset}
            loading={searching}
            variant={"outline"}
            className="w-full sm:w-43"
          >
            <GiftIcon />
            Find random asset
          </Button>
          <Button
            onClick={() => handleSearch()}
            loading={searching}
            className="w-full sm:w-20"
          >
            Search
          </Button>
        </div>
      </div>

      {/* Search Results */}
      {hasSearched ? (
        searchResults.length > 0 ? (
          <div className="mt-4 w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-1">
            {searchResults.map((asset) => (
              <AssetThumbnailCard
                key={asset.tokenAddress}
                asset={asset}
                onClick={() => handleAssetClick(asset.tokenAddress)}
                className={cn(
                  "hover:shadow-lg transition-shadow duration-300 shrink-0",
                  searchResults.length === 1 &&
                    "col-span-2 md:col-span-3 lg:col-span-4",
                  searchResults.length === 2 && "md:col-span-1 lg:col-span-2"
                )}
              />
            ))}
          </div>
        ) : (
          <div className="text-sm text-center py-8  ">
            No assets found. Try a different search term.
          </div>
        )
      ) : null}
    </ScrollableDialog>
  );
};

export default SearchAssetDialog;
