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
import { MediaCategory } from '@/types/media';

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

    // TODO style these better
    if (isError) {
      return (
        <div className="text-center space-y-4">
          <P className="text-3xl">Failed to load asset</P>
          <P className="text-muted-foreground">Please try again later</P>
        </div>
      );
    }

    if (!solanaAsset) {
      return (
        <div className="text-center space-y-4">
          <P className="text-3xl">Asset not found</P>
          <P className="text-muted-foreground">The requested asset could not be found</P>
        </div>
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
        <Button variant={"secondary"} onClick={handleViewMetadata}>View Metadata</Button>
        <Button variant={"secondary"} size="icon" onClick={handleSearch}><SearchIcon /></Button>
      </NavBarActions>
      <SearchAssetDialog open={searchAssetOpen} onOpenChange={setSearchAssetOpen} />
      {solanaAsset && <AssetMetadataDialog open={metadataOpen} onOpenChange={setMetadataOpen} asset={solanaAsset} />}

      {renderContent()}
    </div>
  );
}
