import { BANNER_RATIO, BANNER_RATIO_MOBILE } from "@/constants/ui";
import { useBreakpoints } from "@/context/ResponsiveProvider";
import { MediaType } from "@/types/media";
import { cn } from "@/utils/ui-utils";
import { FC } from "react";
import MediaThumbnail from "../media/MediaThumbnail";
import { AspectRatio } from "../ui/aspect-ratio";

interface BannerImageProps {
  media?: MediaType;
  className?: string;
  fallbackText?: string;
}
export const BannerImage: FC<BannerImageProps> = ({
  media,
  className,
  fallbackText = "ZEUMS",
}) => {
  const { isMd } = useBreakpoints();
  
  const ratio = isMd ? BANNER_RATIO : BANNER_RATIO_MOBILE;
  if (!media)
    return (
      <AspectRatio
        ratio={ratio}
        className={cn(
          "flex justify-center items-center bg-muted text-muted-foreground overflow-hidden",
          "rounded-b-md font-serif",
          className
        )}
      >
        {fallbackText}
      </AspectRatio>
    );
  
  return (
    <MediaThumbnail
      unoptimized={false}
      size="full"
      media={media}
      alt={"Banner Image"}
      objectFit="object-cover"
      rounding="rounded-b-md"
      ratio={ratio}
      className={className}
    />
  );
};