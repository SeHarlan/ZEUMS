import { MediaType } from "@/types/media";
import { cn } from "@/utils/ui-utils";
import { AspectRatio } from "../ui/aspect-ratio";
import MediaThumbnail from "../media/MediaThumbnail";

interface ProfileImageProps {
  media?: MediaType;
  className?: string;
  fallbackText?: string;
}

export const ProfileImage = ({
  media,
  className = "size-6",
  fallbackText = "Z",
}: ProfileImageProps) => {

  if (!media)
    return (
      <AspectRatio
        ratio={1}
        className={cn(
          "flex justify-center items-center bg-muted text-muted-foreground overflow-hidden",
          "rounded-full font-serif",
          className
        )}
      >
        {fallbackText}
      </AspectRatio>
    );

  return (
    <MediaThumbnail
      unoptimized={false}
      media={media}
      alt={"Profile Image"}
      objectFit="object-cover"
      rounding="rounded-full"
      ratio={1}
      className={className}
    />
  );
};

