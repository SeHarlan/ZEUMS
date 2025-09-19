"use client"

import Image from "next/image";
import { FC, useState, useEffect } from "react";
import { getMediaUrl } from "@/utils/media";
import { 
  ImageOffIcon, 
  MonitorOffIcon 
} from "lucide-react";
import { cn } from "@/utils/ui-utils";
import { MediaCategory } from "@/types/media";
import VideoViewer from "../media/VideoViewer";
import HtmlViewer from "../media/HtmlViewer";
import ModelViewer from "../media/ModelViewer";
import { UserAssetEntry } from "@/types/entry";
import { useImageFallback } from "@/hooks/useImageFallback";
import { isBlockchainImage, isUserImage } from "@/types/media";
import { ParsedBlockChainAsset } from "@/types/asset";

interface FullAssetViewerProps {
  asset: ParsedBlockChainAsset | UserAssetEntry;
  className?: string;
}

const FullAssetViewer: FC<FullAssetViewerProps> = ({
  asset,
  className,
}) => {
  const { isLoaded, isLoading, isError, imageUrl, onError, onLoad } =
    useImageFallback(asset.media);

  const [mediaError, setMediaError] = useState(false);

  const media = asset.media;
  const alt = asset.title || "Asset Media";

  const isImage = isBlockchainImage(media) || isUserImage(media);

  //other media types handle their own loading states
  const isImageLoading = isLoading && isImage;

  const handleMediaError = () => {
    setMediaError(true);
  };

  // Reset error state when asset changes
  useEffect(() => {
    setMediaError(false);
  }, [asset.title, media.category]);

  const renderContent = () => {
    if (mediaError) {
      return  <MonitorOffIcon className="size-14" />;
    }

    if (isError && isImage) {
      return <ImageOffIcon className="size-14" />;
    }

    switch (media.category) {
      case MediaCategory.Video:
        return (
          <VideoViewer
            src={getMediaUrl(media)}
            poster={imageUrl}
            autoPlay
            loop
            controls
            onError={handleMediaError}
            className="max-h-screen w-fit"
            containerClassName="h-fit w-fit"
          />
        );
      case MediaCategory.Html:
        return (
          <HtmlViewer src={getMediaUrl(media)} onError={handleMediaError} />
        );
      case MediaCategory.Vr:
        return (
          <ModelViewer src={getMediaUrl(media)} onError={handleMediaError} />
        );
      default:
        return (
          <Image
            unoptimized={false}
            loading="eager"
            priority
            fill
            sizes="100vw"
            onError={onError}
            onLoad={onLoad}
            src={imageUrl}
            alt={alt}
            className={cn(
              "object-contain",
              "transition-opacity duration-200",
              isLoaded ? "opacity-100" : "opacity-0"
            )}
          />
        );
    }   
  };

  return (
    <div
      className={cn(
        "relative w-full h-full max-h-full flex justify-center items-center",
        isImageLoading && "animate-skeleton-shimmer",
        className
      )}
    >
      {renderContent()}
      
      {/* Blurred background image */}
      <div className="absolute inset-0 -z-10 overflow-hidden bg-neutral-600">
        <Image
          unoptimized={false}
          loading="eager"
          priority
          fill
          src={imageUrl}
          alt="blurred background"
          aria-hidden="true"
          className={cn("object-cover", !mediaError && "scale-125 blur-3xl opacity-50")}
        />
      </div>
    </div>
  );
};

export default FullAssetViewer;
