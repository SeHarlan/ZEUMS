'use client';

import { use, useState } from 'react';
import useSolanaAsset from '@/hooks/useSolanaAsset';
import FullAssetViewer from '@/components/assets/FullAssetViewer';
import { H1, P } from '@/components/typography/Typography';
import AutomatedProgress from '@/components/general/AutomatedProgress';
import { Button } from '@/components/ui/button';
import { NavBarActions } from '@/context/NavBarActionsProvider';
import { SearchIcon } from 'lucide-react';
import SearchAssetDialog from '@/components/assets/SearchAssetDialog';

interface Props {
  params: Promise<{ id: string }>;
}

export default function SolanaAssetPage({ params }: Props) {
  const resolvedParams = use(params);
  const { solanaAsset, isLoading, isError } = useSolanaAsset(resolvedParams.id);
  const [searchAssetOpen, setSearchAssetOpen] = useState(false);
  
  const handleSearch =() => {
    setSearchAssetOpen(true);
  }

  const handleViewMetadata = () => { 

  }
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="w-full max-w-xl p-8 space-y-4">
          <H1 className="text-center">Z</H1>
          <AutomatedProgress complete={false} loading={true} />
        </div>
      );
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

      {renderContent()}
    </div>
  );
}
