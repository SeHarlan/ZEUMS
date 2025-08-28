'use client';

import { use } from 'react';
import useSolanaAsset from '@/hooks/useSolanaAsset';
import FullAssetViewer from '@/components/assets/FullAssetViewer';
import { H1, P } from '@/components/typography/Typography';
import AutomatedProgress from '@/components/general/AutomatedProgress';

interface Props {
  params: Promise<{ id: string }>;
}

export default function SolanaAssetPage({ params }: Props) {
  const resolvedParams = use(params);
  const { solanaAsset, isLoading, isError } = useSolanaAsset(resolvedParams.id);
  
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
      {renderContent()}
    </div>
  );
}
