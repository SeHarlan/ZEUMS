'use client';

import { useShowReturnButton } from '@/atoms/navigation';
import FullAssetViewer from '@/components/assets/FullAssetViewer';
import AssetMetadataDialog from '@/components/assets/MetadataDialog';
import FeedbackWrapper from '@/components/general/FeedbackWrapper';
import { BlockchainAssetEntryIcon } from '@/components/icons/EntryTypes';
import { ShareButton } from '@/components/navigation/ShareButton';
import { Button } from '@/components/ui/button';
import { NavBarActions } from '@/context/NavBarActionsProvider';
import useSolanaAsset from '@/hooks/useSolanaAsset';
import { useParams } from 'next/navigation';
import { useState } from 'react';


export default function SolanaAssetPage() {
  const { id }= useParams<{id: string}>()
  const { solanaAsset, isLoading, isError } = useSolanaAsset(id);
  const [metadataOpen, setMetadataOpen] = useState(false);

  useShowReturnButton();


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
          <BlockchainAssetEntryIcon />
          <span className="hidden lg:block">Metadata</span>
        </Button>
        <ShareButton />
      </NavBarActions>

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
