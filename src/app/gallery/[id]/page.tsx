"use client";

import FeedbackWrapper from "@/components/general/FeedbackWrapper";
import { PageContainer } from "@/components/general/PageContainer";
import { P } from "@/components/typography/Typography";
import { USER_GALLERY } from "@/constants/clientRoutes";
import useGalleryById from "@/hooks/useGalleryById";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

const GalleryPage = () => {
  const { id } = useParams<{ id: string }>();
  const { gallery, isLoading, isError } = useGalleryById(id);
  const router = useRouter();

  useEffect(() => {
    const newPath = USER_GALLERY(gallery?.ownerData?.username, gallery?.title);
    if (newPath) {
      // Redirect to the new route with username and gallery name
      router.replace(newPath);
    }
  }, [gallery, router]);

  return (
    <PageContainer maxWidth="large" noPadding>
      <FeedbackWrapper
        isLoading={isLoading}
        isError={isError}
        hasData={!!gallery}
        noDataSubtitle="Gallery not found"
      >
        <P className="absolute-center">Redirecting...</P>
      </FeedbackWrapper>
    </PageContainer>
  );
}

export default GalleryPage;