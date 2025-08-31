"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PrefixInput } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SearchIcon } from "lucide-react";
import { PublicKey } from "@solana/web3.js";
import { BLOCKCHAIN_MEDIA_PATHS } from "@/constants/clientRoutes";
import { ChainIdsEnum } from "@/types/wallet";

interface SearchAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SearchAssetDialog: React.FC<SearchAssetDialogProps> = ({ open, onOpenChange }) => {
  const [searchInput, setSearchInput] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
    const address = searchInput.trim();

    if (!address) {
      setError("Please enter a Solana mint address");
      return;
    }

    if (!isValidSolanaAddress(address)) {
      setError("Invalid Solana mint address format");
      return;
    }

    const validAddress = address;

    setIsLoading(true);
    setError("");

    try {
      // Navigate to the media/solana/{address} page
      router.push(BLOCKCHAIN_MEDIA_PATHS[ChainIdsEnum.SOLANA](validAddress));
      onOpenChange(false);
      setSearchInput("");
    } catch {
      setError("Failed to navigate to asset");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} >
      <DialogContent className="sm:max-w-lg bg-popover-blur ">
        <DialogHeader>
          <DialogTitle>Search Solana Assets</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <PrefixInput
            wrapperClassName="bg-background"
            icon={<SearchIcon className="max-w-4 max-h-4" />}
            placeholder="Enter Solana mint address"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyPress}
          />

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button onClick={handleSearch} loading={isLoading}>
            Search
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SearchAssetDialog;
