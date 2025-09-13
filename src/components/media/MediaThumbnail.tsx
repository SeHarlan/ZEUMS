import Image from "next/image";
import { AspectRatio } from "../ui/aspect-ratio";
import { FC, SyntheticEvent } from "react";
import { ImageOffIcon } from "lucide-react";
import { cn } from "@/utils/ui-utils";
import { MediaType } from "@/types/media";
import { useImageFallback } from "@/hooks/useImageFallback";

interface MediaThumbnailProps {
  media: MediaType;
  onLoad?: (imageElement: HTMLImageElement) => void;
  objectFit?: "object-cover" | "object-contain";
  rounding?: "rounded-sm" | "rounded-md" | "rounded-lg" | "rounded-full";
  ratio?: number;
  className?: string;
  alt?: string;
}

const MediaThumbnail: FC<MediaThumbnailProps> = ({
  media,
  onLoad,
  objectFit = "object-contain",
  rounding = "rounded-md",
  ratio = 1,
  className,
  alt,
}) => {
  const {
    isLoaded,
    isLoading,
    isError,
    imageUrl,
    onError,
    onLoad: onImageLoad,
  } = useImageFallback(media);

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
        unoptimized
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