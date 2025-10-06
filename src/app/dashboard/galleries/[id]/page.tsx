"use client";

import { PageContainer } from "@/components/general/PageContainer";
import PageHeading from "@/components/general/PageHeading";
import { PageTurnLeft } from "@/components/dashboard/PageTurnButtons";
import { Card, CardContent } from "@/components/ui/card";
import { EDIT_GALLERIES, USER_GALLERY } from "@/constants/clientRoutes";
import useGalleryById from "@/hooks/useGalleryById";
import { useParams } from "next/navigation";
import EditGalleryItems from "@/components/dashboard/editGalleryItems/EditGalleryItems";
import FeedbackWrapper from "@/components/general/FeedbackWrapper";
import { NavBarActions } from "@/context/NavBarActionsProvider";
import { EyeIcon } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { P } from "@/components/typography/Typography";

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
      <NavBarActions>
        <LinkButton
          href={USER_GALLERY(id)}
          variant="outline"
          
        >
          <P className="">View Gallery</P>
          <EyeIcon />
        </LinkButton>
      </NavBarActions>
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