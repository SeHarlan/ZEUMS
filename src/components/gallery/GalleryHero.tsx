import { ProfileImage } from "@/components/timeline/ProfileImage";
import { H1, P } from "@/components/typography/Typography";
import { LinkButton } from "@/components/ui/button";
import { USER_TIMELINE } from "@/constants/clientRoutes";
import { UploadCategory } from "@/constants/uploadCategories";
import { EntrySource } from "@/types/entry";
import { getDisplayName } from "@/utils/user";

import { GalleryType } from "@/types/gallery";
import { cn } from "@/utils/ui-utils";
import { FC, useMemo } from "react";
import { EditGallerySettingsButton } from "../dashboard/editGalleryItems/EditGallerySettingsButton";
import { PAGE_PADDING_X } from "../general/PageContainer";
import { BannerImage } from "../timeline/BannerImage";

interface GalleryHeroProps {
  gallery?: GalleryType | null;
  editMode?: boolean;
}
export const GalleryHero: FC<GalleryHeroProps> = ({ gallery, editMode = false }) => {
  const attribution =
    gallery?.source === EntrySource.Creator ? "Created by" : "Collected by";

  const username = gallery?.ownerData?.username;
  const attributionLink = username ? USER_TIMELINE(username) : "";
  const profileImage = gallery?.ownerData?.profileImage;

  const bannerMedia = gallery?.bannerImage;

  // Create blobUrlBuilderProps using the gallery owner's ID
  const galleryBannerBlobUrlBuilderProps = useMemo(() => {
    if (!gallery?.owner) return undefined;
    return {
      userId: gallery.owner.toString(),
      category: UploadCategory.GALLERY_BANNER,
    };
  }, [gallery]);

  const profileBlobUrlBuilderProps = useMemo(() => {
    if (!gallery?.owner) return undefined;
    return {
      userId: gallery.owner.toString(),
      category: UploadCategory.PROFILE_PICTURE,
    };
  }, [gallery]);

  return (
    <div>
      {bannerMedia && (
        <BannerImage
          media={bannerMedia}
          className="text-5xl mb-6 md:mb-12 md:shadow-lg rounded-none xl:rounded-b-md"
          fallbackText={gallery?.title}
          blobUrlBuilderProps={galleryBannerBlobUrlBuilderProps}
        />
      )}

      <div
        className={cn(
          "text-center space-y-4 z-10 py-8 md:py-16",
          !bannerMedia && "pt-20 md:pt-30",
          PAGE_PADDING_X
        )}
      >
        <div className="relative mx-auto w-fit">
          {editMode && (
            <EditGallerySettingsButton
              gallery={gallery}
              buttonVariant="default"
              buttonClassName="z-20 shadow-md absolute right-0 top-0 -translate-y-full md:translate-x-1/3"
            />
          )}
          <H1 className="">{gallery?.title}</H1>
        </div>
        <LinkButton
          href={attributionLink}
          variant="link"
          className="relative mx-auto h-auto w-fit flex items-center gap-4"
        >
          <div className="size-10">
            <ProfileImage
              media={profileImage}
              className="shrink-0 border"
              blobUrlBuilderProps={profileBlobUrlBuilderProps}
            />
          </div>
          <P>
            {attribution} {getDisplayName(gallery?.ownerData || null)}
          </P>
        </LinkButton>
        {gallery?.description && (
          <P className="text-muted-foreground whitespace-pre-line">
            {gallery.description}
          </P>
        )}
      </div>
    </div>
  );
};
