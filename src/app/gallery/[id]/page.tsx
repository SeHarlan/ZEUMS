"use client";

import FeedbackWrapper from "@/components/general/FeedbackWrapper";
import { PageContainer } from "@/components/general/PageContainer";
import useGalleryById from "@/hooks/useGalleryById";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

const GalleryPage = () => {
  const { id } = useParams<{ id: string }>();
  const { gallery, isLoading, isError } = useGalleryById(id);
  const router = useRouter();

  useEffect(() => {
    if (gallery?.ownerData?.username && gallery?.title) {
      // Redirect to the new route with username and gallery name
      router.replace(`/${gallery.ownerData.username}/${gallery.title}`);
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
        <div className="flex items-center justify-center min-h-[50vh]">
          <p>Redirecting...</p>
        </div>
      </FeedbackWrapper>
    </PageContainer>
  );
}

export default GalleryPage;