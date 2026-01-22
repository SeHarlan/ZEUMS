'use client';

import { useShowReturnButton } from '@/atoms/navigation';
import FullAssetViewer from '@/components/assets/FullAssetViewer';
import FeedbackWrapper from '@/components/general/FeedbackWrapper';
import { PageContainer } from '@/components/general/PageContainer';
import { ShareButton } from '@/components/navigation/ShareButton';
import { UploadCategory } from '@/constants/uploadCategories';
import { NavBarActions } from '@/context/NavBarActionsProvider';
import useUserAsset from '@/hooks/useUserAsset';
import { isUserAssetEntry } from '@/types/entry';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';


export default function UserAssetPage() {
  const { assetId } = useParams<{ assetId: string }>();
  const { userAsset, isLoading, isError } = useUserAsset(assetId);

  // Create blobUrlBuilderProps for UserAssetEntry
  const blobUrlBuilderProps = useMemo(() => {
    if (userAsset && isUserAssetEntry(userAsset)) {
      const userId = userAsset.owner.toString();
      return {
        userId,
        category: UploadCategory.UPLOADED_IMAGE,
      };
    }
    return undefined;
  }, [userAsset]);

  useShowReturnButton();


  return (
    <PageContainer maxWidth="full" noPadding>
      <div className="w-full h-screen relative flex items-center justify-center">
        <NavBarActions>
          <ShareButton />
        </NavBarActions>

        <FeedbackWrapper
          isLoading={isLoading}
          isError={isError}
          hasData={!!userAsset}
          errorSubtitle={"Failed to load asset"}
          noDataSubtitle={"Asset not found"}
        >
          {userAsset && <FullAssetViewer asset={userAsset} blobUrlBuilderProps={blobUrlBuilderProps} />}
        </FeedbackWrapper>
      </div>
    </PageContainer>
  );
}
