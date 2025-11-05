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
  const { isMd, isLg, isXl} = useBreakpoints();
  
  const ratio = isMd ? BANNER_RATIO : BANNER_RATIO_MOBILE;
  if (!media)
    return (
      <AspectRatio
        ratio={ratio}
        className={cn(
          "flex justify-center items-center bg-border/75 text-muted-foreground overflow-hidden",
          "rounded-b-md font-serif",
          className
        )}
      >
        {fallbackText}
      </AspectRatio>
    );
  
  const getWidth = () => {
    // sizing up for better quality
    if (isXl) return "2xl";
    if (isLg) return "xl";
    if (isMd) return "lg";
    return "md";
  };
  
  const width = getWidth();
  
  return (
    <MediaThumbnail
      quality={90}
      size={width}
      media={media}
      alt={"Banner Image"}
      objectFit="object-cover"
      rounding="rounded-b-md"
      ratio={ratio}
      className={className}
    />
  );
};