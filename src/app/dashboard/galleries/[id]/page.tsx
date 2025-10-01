"use client";

import { PageContainer } from "@/components/general/PageContainer";
import PageHeading from "@/components/general/PageHeading";
import { PageTurnLeft } from "@/components/dashboard/PageTurnButtons";
import { Card, CardContent } from "@/components/ui/card";
import { EDIT_GALLERIES } from "@/constants/clientRoutes";
import useGalleryById from "@/hooks/useGalleryById";
import { useParams } from "next/navigation";
import EditGalleryItems from "@/components/dashboard/editGalleryItems/EditGalleryItems";
import FeedbackWrapper from "@/components/general/FeedbackWrapper";

const EditGalleryPage = () => {
  const { id } = useParams<{ id: string }>();
  const { gallery, isLoading, isError } = useGalleryById(id);

  return (
    <PageContainer maxWidth="large">
      <PageHeading
        title={`Edit ${gallery?.title || "Gallery Items"}`}
        subtitle="Curate and manage your gallery content"
      />

      <PageTurnLeft path={EDIT_GALLERIES} />
      <FeedbackWrapper
        isLoading={isLoading}
        isError={isError}
        hasData={!!gallery}
        noDataSubtitle="Gallery not found"
        useSpinner
      >
        <Card>
          <CardContent>
            <EditGalleryItems galleryId={id} />
          </CardContent>
        </Card>
      </FeedbackWrapper>
    </PageContainer>
  );
};

export default EditGalleryPage;