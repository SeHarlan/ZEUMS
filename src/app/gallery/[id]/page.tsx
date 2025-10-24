"use client";

import GalleryBase from "@/components/gallery/GalleryBase";
import { GalleryHero } from "@/components/gallery/GalleryHero";
import GalleryItemBase from "@/components/gallery/GalleryItemBase";
import FeedbackWrapper from "@/components/general/FeedbackWrapper";
import { PageContainer } from "@/components/general/PageContainer";
import { ShareButton } from "@/components/navigation/ShareButton";
import { NavBarActions } from "@/context/NavBarActionsProvider";
import useGalleryById from "@/hooks/useGalleryById";
import { useParams } from "next/navigation";

const GalleryPage = () => {
  const { id } = useParams<{ id: string }>();
  const { gallery, isLoading, isError } = useGalleryById(id);

  return (
    <PageContainer maxWidth="large" noPadding>
      <NavBarActions>
        <ShareButton />
      </NavBarActions>
      <FeedbackWrapper
        isLoading={isLoading}
        isError={isError}
        hasData={!!gallery}
        noDataSubtitle="Gallery not found"
      >
        <GalleryHero gallery={gallery} />
        <GalleryBase gallery={gallery} ItemComponent={GalleryItemBase} />
      </FeedbackWrapper>
    </PageContainer>
  );
}

export default GalleryPage;