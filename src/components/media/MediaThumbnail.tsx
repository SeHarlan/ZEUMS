"use client";
import { ImageSizing, imageSizing } from "@/constants/ui";
import { useImageFallback } from "@/hooks/useImageFallback";
import { BlobUrlBuilderProps, MediaType } from "@/types/media";
import resizeLoader from "@/utils/imageLoader";
import { cn } from "@/utils/ui-utils";
import { ImageOffIcon } from "lucide-react";
import Image from "next/image";
import { FC, SyntheticEvent } from "react";
import { AspectRatio } from "../ui/aspect-ratio";

interface MediaThumbnailProps {
  media: MediaType;
  /** 
   * Set to false for public images.
   * Keep true for user specific images. 
   * 
   * Custom loader skips the public Next.js cache but still caches them for an individual browser.
   * Add "unoptimized" to skip optimization altogether
   * */
  useCustomLoader?: boolean;
  unoptimized?: boolean;
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
  size?: ImageSizing;
  priority?: boolean;
  noPadding?: boolean;
  quality?: number;
  blobUrlBuilderProps?: BlobUrlBuilderProps;
}

const MediaThumbnail: FC<MediaThumbnailProps> = ({
  useCustomLoader = true,
  media,
  unoptimized,
  onLoad,
  onError,
  objectFit = "object-contain",
  rounding = "rounded-md",
  ratio = 1,
  className,
  alt,
  size = "thumbnail",
  priority,
  noPadding,
  quality = 50,
  blobUrlBuilderProps,
}) => {
  const {
    isLoaded,
    isLoading,
    isError,
    imageUrl,
    onError: handleFallbackError,
    onLoad: handleFallbackLoad,
  } = useImageFallback({ media, onFinalError: onError, blobUrlBuilderProps });

  const handleLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    handleFallbackLoad();
    onLoad?.(event.currentTarget);
  };

  const renderContent = () => {
    //broken image
    if (isError) return <ImageOffIcon className="size-8" />;

    const width = imageSizing[size];
    const height = width / ratio;

    return (
      <Image
        loader={useCustomLoader ? resizeLoader : undefined}
        unoptimized={unoptimized}
        height={height}
        width={width}
        sizes={`${width}px`}
        quality={quality}
        loading={priority ? "eager" : "lazy"}
        onError={handleFallbackError}
        onLoad={handleLoad}
        src={imageUrl}
        alt={alt || "Media Thumbnail"}
        className={cn(
          "w-full h-full transition-opacity duration-400 rounded",
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
        "flex justify-center items-center bg-muted text-muted-foreground overflow-hidden transition-opacity duration-500",
        rounding,
        isLoading && "animate-skeleton-shimmer",
        objectFit === "object-contain" && !noPadding && "p-2",
        className
      )}
    >
      {renderContent()}
    </AspectRatio>
  );
};

export default MediaThumbnail;