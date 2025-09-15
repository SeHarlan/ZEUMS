"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PrefixInput } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SearchIcon } from "lucide-react";
import { PublicKey } from "@solana/web3.js";
import { BLOCKCHAIN_MEDIA_PATHS } from "@/constants/clientRoutes";
import { ChainIdsEnum } from "@/types/wallet";
import axios from "axios";
import { ParsedBlockChainAsset } from "@/types/asset";
import AssetThumbnailCard from "./AssetThumbnailCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import LoadingSpinner from "../general/LoadingSpinner";

interface SearchAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SearchAssetDialog: React.FC<SearchAssetDialogProps> = ({ open, onOpenChange }) => {
  const [searchInput, setSearchInput] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<ParsedBlockChainAsset[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const router = useRouter();

  // Basic Solana address validation (base58, 32-44 chars)
  const isValidSolanaAddress = (address: string): boolean => {
    try {
      const pk = new PublicKey(address.trim());
      return pk.toBase58() === address.trim(); // checks canonical base58 encoding
    } catch {
      return false;
    }
  };

  const handleSearch = async () => {
    const searchTerm = searchInput.trim();

    if (!searchTerm) {
      setError("Please enter a search term");
      return;
    }

    setIsLoading(true);
    setError("");
    setSearchResults([]);
    setHasSearched(true);

    try {
      // Call the API route to search for blockchain assets
      const response = await axios.get(`/api/search/assets?q=${encodeURIComponent(searchTerm)}`);
      const results = response.data.slice(0, 10); // Limit to 10 results
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
      setError("Failed to search for assets. Please try again.");
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleAssetClick = (asset: ParsedBlockChainAsset) => {
    // Navigate to the asset page when clicked
    router.push(BLOCKCHAIN_MEDIA_PATHS[ChainIdsEnum.SOLANA](asset.tokenAddress));
    onOpenChange(false);
    setSearchInput("");
    setSearchResults([]);
    setHasSearched(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl bg-popover-blur max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Search Blockchain Assets</DialogTitle>
          <DialogDescription className="sr-only">
            This dialog allows you to search for blockchain assets.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <PrefixInput
              wrapperClassName="bg-background"
              icon={<SearchIcon className="size-4 text-muted-foreground" />}
              placeholder="Search for assets by name, address, or description"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            {error && <p className="text-sm text-destructive bg-background/25 rounded-sm px-2.5 py-0.5 w-fit">{error}</p>}
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSearch} loading={isLoading}>
              Search
            </Button>
          </div>

          {/* Search Results */}
          {hasSearched && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {isLoading ? "Searching..." : `Found ${searchResults.length} assets`}
                </h3>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner iconClass="size-8" />
                </div>
              ) : searchResults.length > 0 ? (
                <ScrollArea className="max-h-96">
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 p-2">
                    {searchResults.map((asset) => (
                      <AssetThumbnailCard
                        key={asset.tokenAddress}
                        asset={asset}
                        onClick={() => handleAssetClick(asset)}
                        className="cursor-pointer border-3 hover:shadow-md transition-shadow duration-300 border-transparent hover:border-primary"
                      />
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No assets found. Try a different search term.
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchAssetDialog;
