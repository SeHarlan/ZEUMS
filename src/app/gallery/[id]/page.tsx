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

const GalleryPage = () => {
  const { id } = useParams<{ id: string }>();
  const { gallery, isLoading, isError } = useGalleryById(id);
  const attribution = gallery?.source === EntrySource.Creator ? "Created by" : "Collected by";

  const username = gallery?.ownerData?.username;
  const attributionLink = username ? USER_TIMELINE(username) : "";
  const profileImage = gallery?.ownerData?.profileImage;
  console.log("🚀 ~ GalleryPage ~ gallery?.ownerData:", gallery?.ownerData)
  
  return (
    <PageContainer maxWidth="large">
      <FeedbackWrapper
        isLoading={isLoading}
        isError={isError}
        hasData={!!gallery}
        noDataSubtitle="Gallery not found"
      >
        <div className="rounded-md p-6.25 lg:p-12.5 mb-18.75 text-center space-y-4 shadow border bg-secondary">
          <H1>{gallery?.title}</H1>
          <LinkButton
            href={attributionLink}
            variant="link"
            className="relative mx-auto h-auto w-fit flex items-center gap-4"
          >
            <div className="size-10">
              <ProfileImage media={profileImage} className="flex-shrink-0" />
            </div>
            <P>
              {attribution} {getDisplayName(gallery?.ownerData || null)}
            </P>
          </LinkButton>
          <P className="text-muted-foreground whitespace-pre-line">
            {gallery?.description}
          </P>
        </div>
        <GalleryBase gallery={gallery} ItemComponent={GalleryItemBase} />
      </FeedbackWrapper>
    </PageContainer>
  );
}

export default GalleryPage;