'use client';

import { use, useState } from 'react';
import useSolanaAsset from '@/hooks/useSolanaAsset';
import FullAssetViewer from '@/components/assets/FullAssetViewer';
import { P } from '@/components/typography/Typography';
import { Button } from '@/components/ui/button';
import { NavBarActions } from '@/context/NavBarActionsProvider';
import { SearchIcon } from 'lucide-react';
import SearchAssetDialog from '@/components/assets/SearchAssetDialog';
import AssetMetadataDialog from '@/components/assets/MetadataDialog';
import LoadingPage from '@/components/general/LoadingPage';
import GlitchFeedback from '@/components/pages/landing/GlitchFeedback';
import { TITLE_COPY } from '@/textCopy/mainCopy';
import BasicNavDialog from '@/components/general/BasicNavDialog';

interface Props {
  params: Promise<{ id: string }>;
}

export default function SolanaAssetPage({ params }: Props) {
  const resolvedParams = use(params);
  const { solanaAsset, isLoading, isError } = useSolanaAsset(resolvedParams.id);
  const [searchAssetOpen, setSearchAssetOpen] = useState(false);
  const [metadataOpen, setMetadataOpen] = useState(false);

  const handleSearch =() => {
    setSearchAssetOpen(true);
  }

  const handleViewMetadata = () => { 
    setMetadataOpen(true);
  }

  const renderContent = () => {
    if (isLoading) {
      return <LoadingPage complete={false} loading={true} />
    }

    if (isError || !solanaAsset) {
      let subtitle = "";
      if (isError) subtitle = "Failed to load asset";
      if (!solanaAsset) subtitle = "Asset not found";
      return (
        <>
          <GlitchFeedback title={TITLE_COPY} subtitle={subtitle} />
          <BasicNavDialog />
        </>
      );
    }

    return (
      <FullAssetViewer 
        asset={solanaAsset}
      />
    );
  };

  return (
    <div className="w-full h-screen relative flex items-center justify-center">
      <NavBarActions>
        <Button
          variant={"secondary"}
          onClick={handleViewMetadata}
          className="h-10"
        >
          View Metadata
        </Button>
        <Button
          variant={"secondary"}
          size="icon"
          onClick={handleSearch}
          className="size-10"
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

      {renderContent()}
    </div>
  );
}
