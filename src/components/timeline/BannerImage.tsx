import { FC } from "react";
import MediaThumbnail from "../media/MediaThumbnail";
import { MediaType } from "@/types/media";
import { cn } from "@/utils/ui-utils";
import { AspectRatio } from "../ui/aspect-ratio";

interface BannerImageProps {
  media?: MediaType;
  className?: string;
  fallbackText?: string;
}

export const BANNER_RATIO = 3 / 1;

export const BannerImage: FC<BannerImageProps> = ({
  media,
  className,
  fallbackText = "ZEUMS",
}) => {
  if (!media)
    return (
      <AspectRatio
        ratio={BANNER_RATIO}
        className={cn(
          "flex justify-center items-center bg-muted text-muted-foreground overflow-hidden",
          "rounded-md font-serif",
          className
        )}
      >
        {fallbackText}
      </AspectRatio>
    );

  return (
    <MediaThumbnail
      media={media}
      alt={"Banner Image"}
      objectFit="object-cover"
      rounding="rounded-md"
      ratio={BANNER_RATIO}
      className={className}
    />
  );
};