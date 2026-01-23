import { BlobUrlBuilderProps, MediaType } from "@/types/media";
import { cn } from "@/utils/ui-utils";
import MediaThumbnail from "../media/MediaThumbnail";
import { AspectRatio } from "../ui/aspect-ratio";

interface ProfileImageProps {
  media?: MediaType;
  className?: string;
  fallbackText?: string;
  blobUrlBuilderProps?: BlobUrlBuilderProps;
}

export const ProfileImage = ({
  media,
  className = "size-6",
  fallbackText = "Z",
  blobUrlBuilderProps,
}: ProfileImageProps) => {

  if (!media)
    return (
      <AspectRatio
        ratio={1}
        className={cn(
          "flex justify-center items-center bg-border/75 text-muted-foreground overflow-hidden",
          "rounded-full font-serif",
          className
        )}
      >
        {fallbackText}
      </AspectRatio>
    );

  return (
    <MediaThumbnail
      useCustomLoader={false}
      quality={85}
      media={media}
      alt={"Profile Image"}
      objectFit="object-cover"
      rounding="rounded-full"
      ratio={1}
      className={className}
      blobUrlBuilderProps={blobUrlBuilderProps}
    />
  );
};

