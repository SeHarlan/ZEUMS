"use client";

import EditGalleryItems from "@/components/dashboard/editGalleryItems/EditGalleryItems";
import { PageTurnLeft } from "@/components/dashboard/PageTurnButtons";
import { GalleryHero } from "@/components/gallery/GalleryHero";
import FeedbackWrapper from "@/components/general/FeedbackWrapper";
import { PageContainer } from "@/components/general/PageContainer";
import PageHeading from "@/components/general/PageHeading";
import { P } from "@/components/typography/Typography";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EDIT_GALLERIES, USER_GALLERY } from "@/constants/clientRoutes";
import { NavBarActions } from "@/context/NavBarActionsProvider";
import useGalleryById from "@/hooks/useGalleryById";
import { EyeIcon } from "lucide-react";
import { useParams } from "next/navigation";

const EditGalleryPage = () => {
  const { id } = useParams<{ id: string }>();
  const { gallery, isLoading, isError } = useGalleryById(id);

  return (
    <PageContainer maxWidth="large">
      <PageHeading
        title="Manage Gallery"
        subtitle="A focused collection of related artworks"
      />

      <PageTurnLeft path={EDIT_GALLERIES} />
      <NavBarActions>
        <LinkButton href={USER_GALLERY(id)} variant="outline">
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
        <Card className="pt-0 overflow-hidden">
          <GalleryHero gallery={gallery} editMode />

          <EditGalleryItems galleryId={id} />
        </Card>
      </FeedbackWrapper>
    </PageContainer>
  );
};

export default EditGalleryPage;