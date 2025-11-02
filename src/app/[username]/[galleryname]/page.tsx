"use client";

import GalleryBase from "@/components/gallery/GalleryBase";
import { GalleryHero } from "@/components/gallery/GalleryHero";
import GalleryItemBase from "@/components/gallery/GalleryItemBase";
import FeedbackWrapper from "@/components/general/FeedbackWrapper";
import { PageContainer } from "@/components/general/PageContainer";
import { ShareButton } from "@/components/navigation/ShareButton";
import { P } from "@/components/typography/Typography";
import { LinkButton } from "@/components/ui/button";
import { EDIT_GALLERY } from "@/constants/clientRoutes";
import { NavBarActions } from "@/context/NavBarActionsProvider";
import { useUser } from "@/context/UserProvider";
import useGalleryByUsernameAndName from "@/hooks/useGalleryByUsernameAndName";
import { EditIcon } from "lucide-react";
import { useParams } from "next/navigation";

const GalleryPage = () => {
  const { username, galleryname } = useParams<{ username: string; galleryname: string }>();
  const { gallery, isLoading, isError } = useGalleryByUsernameAndName(username, galleryname);
  const { user: loggedInUser } = useUser();
  
  const isUsersPage = loggedInUser?._id === gallery?.owner

  return (
    <PageContainer maxWidth="large" noPadding>
      <NavBarActions>
        {isUsersPage && gallery?._id && (
          <LinkButton
            href={EDIT_GALLERY(gallery._id.toString())}
            variant="outline"
            className="size-10 md:w-fit"
          >
            <EditIcon className="size-5 md:size-4" />
            <P className="hidden md:block">Edit</P>
          </LinkButton>
        )}
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
