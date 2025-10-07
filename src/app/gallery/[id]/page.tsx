"use client";

import useGalleryById from "@/hooks/useGalleryById";
import { useParams } from "next/navigation";
import { PageContainer } from "@/components/general/PageContainer";
import FeedbackWrapper from "@/components/general/FeedbackWrapper"
import GalleryItemBase from "@/components/gallery/GalleryItemBase";
import GalleryBase from "@/components/gallery/GalleryBase";
import { H1, P } from "@/components/typography/Typography";
import { EntrySource } from "@/types/entry";
import { USER_TIMELINE } from "@/constants/clientRoutes";
import { LinkButton } from "@/components/ui/button";
import { ProfileImage } from "@/components/timeline/ProfileImage";
import { getDisplayName } from "@/utils/user";
import { isMediaGalleryItem } from "@/types/galleryItem";
import MediaThumbnail from "@/components/media/MediaThumbnail";

const GalleryPage = () => {
  const { id } = useParams<{ id: string }>();
  const { gallery, isLoading, isError } = useGalleryById(id);
  const attribution = gallery?.source === EntrySource.Creator ? "Created by" : "Collected by";

  const username = gallery?.ownerData?.username;
  const attributionLink = username ? USER_TIMELINE(username) : "";
  const profileImage = gallery?.ownerData?.profileImage;
  
  const firstMediaItem = gallery?.items?.find(item => isMediaGalleryItem(item));
  
  return (
    <PageContainer maxWidth="large">
      <FeedbackWrapper
        isLoading={isLoading}
        isError={isError}
        hasData={!!gallery}
        noDataSubtitle="Gallery not found"
      >
        <div className="relative rounded-lg p-6.25 lg:p-12.5 mb-18.75 bg-secondary border-2  overflow-hidden shadow-md">
          <div className="relative text-center space-y-4 z-10 ">
            <H1>{gallery?.title}</H1>
            <LinkButton
              href={attributionLink}
              variant="link"
              className="relative mx-auto h-auto w-fit flex items-center gap-4"
            >
              <div className="size-10">
                <ProfileImage
                  media={profileImage}
                  className="flex-shrink-0 border"
                />
              </div>
              <P>
                {attribution} {getDisplayName(gallery?.ownerData || null)}
              </P>
            </LinkButton>
            {gallery?.description && (
              <P className="text-primary whitespace-pre-line">
                {gallery.description}
              </P>
            )}
          </div>
          {firstMediaItem && (
            <div className="absolute-center w-full h-full z-0">
              <MediaThumbnail
                media={firstMediaItem.media}
                objectFit="object-cover"
                className="scale-120 blur-3xl opacity-25"
              />
            </div>
          )}
        </div>
        <GalleryBase gallery={gallery} ItemComponent={GalleryItemBase} />
      </FeedbackWrapper>
    </PageContainer>
  );
}

export default GalleryPage;