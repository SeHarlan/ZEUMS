"use client";

import EditGalleryItems from "@/components/dashboard/editGalleryItems/EditGalleryItems";
import { PageTurnLeft } from "@/components/dashboard/PageTurnButtons";
import { GalleryHero } from "@/components/gallery/GalleryHero";
import FeedbackWrapper from "@/components/general/FeedbackWrapper";
import { PageContainer } from "@/components/general/PageContainer";
import { GalleryOnboardingPopover } from "@/components/onboarding/GalleryOnboarding";
import { P } from "@/components/typography/Typography";
import { LinkButton } from "@/components/ui/button";
import { EDIT_GALLERIES, USER_GALLERY } from "@/constants/clientRoutes";
import { NavBarActions } from "@/context/NavBarActionsProvider";
import { useUser } from "@/context/UserProvider";
import useGalleryById from "@/hooks/useGalleryById";
import { EyeIcon } from "lucide-react";
import { useParams } from "next/navigation";

const EditGalleryPage = () => {
  const { id } = useParams<{ id: string }>();
  const { gallery, isLoading, isError } = useGalleryById(id);
  const { user } = useUser();

  const viewGalleryHref = USER_GALLERY(user?.username, gallery?.title);

  return (
    <PageContainer maxWidth="large">
      <PageTurnLeft path={EDIT_GALLERIES} />
      <NavBarActions>
        <LinkButton
          href={viewGalleryHref}
          variant="outline"
          className="size-10 md:w-fit"
        >
          <EyeIcon className="size-5 md:size-4" />
          <P className="hidden md:block">View Gallery</P>
        </LinkButton>
      </NavBarActions>
      <FeedbackWrapper
        isLoading={isLoading}
        isError={isError}
        hasData={!!gallery}
        noDataSubtitle="Gallery not found"
        useSpinner
      >
     
          <GalleryHero gallery={gallery} editMode />

          <EditGalleryItems galleryId={id} />
   
      </FeedbackWrapper>
      <GalleryOnboardingPopover />
    </PageContainer>
  );
};

export default EditGalleryPage;