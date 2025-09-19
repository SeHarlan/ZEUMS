import Image from "next/image";
import { AspectRatio } from "../ui/aspect-ratio";
import { FC, SyntheticEvent } from "react";
import { ImageOffIcon } from "lucide-react";
import { cn } from "@/utils/ui-utils";
import { MediaType } from "@/types/media";
import { useImageFallback } from "@/hooks/useImageFallback";
import { isGif } from "@/utils/media";

interface MediaThumbnailProps {
  media: MediaType;
  onLoad?: (imageElement: HTMLImageElement) => void;
  objectFit?: "object-cover" | "object-contain";
  rounding?: "rounded-none" | "rounded-sm" | "rounded-md" | "rounded-lg" | "rounded-full" | "rounded-b-md";
  ratio?: number;
  className?: string;
  alt?: string;
  /** un-optimized by default, we use this for displaying hundreds of images as they are being browsed in search/selection dialogs */
  optimize?: boolean;
}

const MediaThumbnail: FC<MediaThumbnailProps> = ({
  media,
  onLoad,
  objectFit = "object-contain",
  rounding = "rounded-md",
  ratio = 1,
  className,
  alt,
  optimize = false,
}) => {
  const {
    isLoaded,
    isLoading,
    isError,
    imageUrl,
    onError,
    onLoad: onImageLoad,
  } = useImageFallback(media, { optimize });

  const handleLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    onImageLoad();
    if (onLoad) onLoad(event.currentTarget);
  };

  const renderContent = () => {
    //broken image
    if (isError) return <ImageOffIcon className="size-8" />;

    return (
      <Image
        fill
        unoptimized={!optimize || isGif(media)} 
        loading="lazy"
        onError={onError}
        onLoad={handleLoad}
        src={imageUrl}
        alt={alt || "Media Thumbnail"}
        className={cn(
          "w-full transition-opacity duration-200",
          isLoaded ? "opacity-100" : "opacity-0",
          objectFit,
          objectFit === "object-contain" && "p-3",
        )}
      />
    );
  };

  return (
    <AspectRatio
      ratio={ratio}
      className={cn(
        "flex justify-center items-center bg-muted text-muted-foreground overflow-hidden",
        rounding,
        isLoading && "animate-skeleton-shimmer",
        className
      )}
    >
      {renderContent()}
    </AspectRatio>
  );
};

export default MediaThumbnail;