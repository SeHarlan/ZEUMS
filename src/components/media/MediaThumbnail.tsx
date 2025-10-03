import Image from "next/image";
import { AspectRatio } from "../ui/aspect-ratio";
import { FC, SyntheticEvent } from "react";
import { ImageOffIcon } from "lucide-react";
import { cn } from "@/utils/ui-utils";
import { MediaType } from "@/types/media";
import { useImageFallback } from "@/hooks/useImageFallback";
import { imageBreakpoints } from "@/constants/ui";

interface MediaThumbnailProps {
  media: MediaType;
  onLoad?: (imageElement: HTMLImageElement) => void;
  onError?: () => void;
  objectFit?: "object-cover" | "object-contain";
  rounding?:
    | "rounded-none"
    | "rounded-sm"
    | "rounded-md"
    | "rounded-lg"
    | "rounded-full"
    | "rounded-b-md";
  ratio?: number;
  className?: string;
  alt?: string;
  size?: "small" | "medium" | "full";
  priority?: boolean;
}

const MediaThumbnail: FC<MediaThumbnailProps> = ({
  media,
  onLoad,
  onError,
  objectFit = "object-contain",
  rounding = "rounded-md",
  ratio = 1,
  className,
  alt,
  size = "small",
  priority,
}) => {
  const {
    isLoaded,
    isLoading,
    isError,
    imageUrl,
    onError: handleFallbackError,
    onLoad: handleFallbackLoad,
  } = useImageFallback(media, onError);

  const handleLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    handleFallbackLoad();
    onLoad?.(event.currentTarget);
  };

  const renderContent = () => {
    //broken image
    if (isError) return <ImageOffIcon className="size-8" />;

    const width = imageBreakpoints[size];
    const height = width / ratio;

    return (
      <Image
        height={height}
        width={width}
        unoptimized={true}
        loading={priority ? "eager" : "lazy"}
        onError={handleFallbackError}
        onLoad={handleLoad}
        src={imageUrl}
        alt={alt || "Media Thumbnail"}
        className={cn(
          "w-full h-full transition-opacity duration-200 rounded",
          isLoaded || priority ? "opacity-100" : "opacity-0",
          objectFit
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
        objectFit === "object-contain" && "p-2",
        className
      )}
    >
      {renderContent()}
    </AspectRatio>
  );
};

export default MediaThumbnail;