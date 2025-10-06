'use client';

import { useState } from 'react';
import useSolanaAsset from '@/hooks/useSolanaAsset';
import FullAssetViewer from '@/components/assets/FullAssetViewer';
import { Button } from '@/components/ui/button';
import { NavBarActions } from '@/context/NavBarActionsProvider';
import { SearchIcon } from 'lucide-react';
import SearchAssetDialog from '@/components/assets/SearchAssetDialog';
import AssetMetadataDialog from '@/components/assets/MetadataDialog';
import FeedbackWrapper from '@/components/general/FeedbackWrapper';
import { useParams } from 'next/navigation';


export default function SolanaAssetPage() {
  const { id }= useParams<{id: string}>()
  const { solanaAsset, isLoading, isError } = useSolanaAsset(id);
  const [searchAssetOpen, setSearchAssetOpen] = useState(false);
  const [metadataOpen, setMetadataOpen] = useState(false);

  const handleSearch =() => {
    setSearchAssetOpen(true);
  }

  const handleViewMetadata = () => { 
    setMetadataOpen(true);
  }

  

  return (
    <div className="w-full h-screen relative flex items-center justify-center">
      <NavBarActions>
        <Button
          variant={"outline"}
          onClick={handleViewMetadata}
          className="h-10"
        >
          View Metadata
        </Button>
        <Button
          variant={"outline"}
          size="icon"
          onClick={handleSearch}
          className="size-12 md:size-10"
        >
          <SearchIcon className="size-5" />
        </Button>
      </NavBarActions>

      <SearchAssetDialog
        open={searchAssetOpen}
        onOpenChange={setSearchAssetOpen}
      />
      {solanaAsset && (
        <AssetMetadataDialog
          open={metadataOpen}
          onOpenChange={setMetadataOpen}
          asset={solanaAsset}
        />
      )}

      <FeedbackWrapper
        isLoading={isLoading}
        isError={isError}
        hasData={!!solanaAsset}
        errorSubtitle={"Failed to load asset"}
        noDataSubtitle={"Asset not found"}
      >
        {solanaAsset && <FullAssetViewer asset={solanaAsset} />}
      </FeedbackWrapper>
    </div>
  );
}
