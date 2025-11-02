"use client";

import FeedbackWrapper from "@/components/general/FeedbackWrapper";
import { PageContainer } from "@/components/general/PageContainer";
import PageHeading from "@/components/general/PageHeading";
import MediaThumbnail from "@/components/media/MediaThumbnail";
import { P } from "@/components/typography/Typography";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { USER_GALLERY } from "@/constants/clientRoutes";
import useGalleriesByPage from "@/hooks/useGalleriesByPage";
import { PublicGalleryType } from "@/types/gallery";
import { cn } from "@/utils/ui-utils";
import { getDisplayName } from "@/utils/user";
import { useRouter } from "next/navigation";
import { FC } from "react";

export default function GalleriesPage() { 
  const { galleries, isLoading, isError } = useGalleriesByPage({ page: 1, limit: 16 });
  return (
    <PageContainer>
      <FeedbackWrapper
        isLoading={isLoading}
        isError={isError}
        hasData={!!galleries}
      >
        <PageHeading
          title={`Galleries`}
          subtitle={`Browse galleries created by other users`}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {galleries?.map((gallery) => (
            <GalleryCard key={gallery._id.toString()} gallery={gallery} />
          ))}
        </div>
      </FeedbackWrapper>
    </PageContainer>
  );
}

const GalleryCard: FC<{ gallery: PublicGalleryType }> = ({ gallery }) => {
  const router = useRouter();
  const handleClick = () => {
    router.push(USER_GALLERY(gallery.ownerData?.username, gallery.title));
  };

  // Get the first item's media for the thumbnail
  const thumbnailMedia = gallery.items[0].media;

  return (
    <Card
      className={cn(
        "p-0 overflow-hidden cursor-pointer gap-1 rounded-lg hover:shadow-lg transition-shadow duration-300"
      )}
      onClick={handleClick}
    >
      <CardContent className="p-0 relative">
        <MediaThumbnail media={thumbnailMedia} alt={gallery.title} />
      </CardContent>

      <CardFooter className="pb-1 px-3">
        <div className="flex flex-col w-full">
          <P className="text-lg font-semibold line-clamp-1">{gallery.title}</P>
          {gallery.ownerData && (
            <P className="text-sm text-muted-foreground line-clamp-1">
              by {getDisplayName(gallery.ownerData)}
            </P>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};
