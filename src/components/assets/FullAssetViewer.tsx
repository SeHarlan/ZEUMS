"use client"

import Image from "next/image";
import { FC, useState } from "react";
import { getMediaUrl } from "@/utils/media";
import { 
  BoxIcon, 
  ImageOffIcon, 
  VideoOffIcon, 
  MonitorOffIcon 
} from "lucide-react";
import { cn } from "@/utils/ui-utils";
import { MediaCategory } from "@/types/media";
import { VideoViewer } from "../media/VideoViewer";
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

  const [videoError, setVideoError] = useState(false);
  const [htmlError, setHtmlError] = useState(false);
  const [modelError, setModelError] = useState(false);

  const media = asset.media;
  const alt = asset.title || "Asset Media";

  const isImage = isBlockchainImage(media) || isUserImage(media);

  //other media types handle their own loading states
  const isImageLoading = isLoading && isImage;

  const handleVideoError = () => {
    setVideoError(true);
  };

  const handleHtmlError = () => {
    setHtmlError(true);
  };

  const handleModelError = () => {
    setModelError(true);
  };

  const renderContent = () => {
    // Handle special media types first
    if (media.category === MediaCategory.Video) {
      if (videoError) {
        return <VideoOffIcon className="min-h-14 min-w-14" />;
      }

      return (
        <VideoViewer
          src={getMediaUrl(media)}
          poster={imageUrl}
          controls
          onError={handleVideoError}
          className="max-h-screen w-fit"
          containerClassName="h-fit"
        />
      );
    }

    if (media.category === MediaCategory.Html) {
      if (htmlError) {
        return <MonitorOffIcon className="min-h-14 min-w-14" />;
      }

      return <HtmlViewer src={getMediaUrl(media)} onError={handleHtmlError} />;
    }

    if (media.category === MediaCategory.Vr) {
      if (modelError) {
        return <BoxIcon className="min-h-14 min-w-14" />;
      }

      return (
        <ModelViewer
          src={getMediaUrl(media)}
          poster={imageUrl}
          onError={handleModelError}
        />
      );
    }

    // Handle image media (default case)
    if (isImage) {
      if (isError) {
        return <ImageOffIcon className="min-h-14 min-w-14" />;
      }

      return (
        <Image
          unoptimized={true}
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

    // Fallback for unknown media types
    return <MonitorOffIcon className="min-h-14 min-w-14" />;
  };

  return (
    <div
      className={cn(
        "relative w-full h-full max-h-full flex justify-center items-center",
        isImageLoading && "animate-skeleton-shimmer",
        className
      )}
    >
      {/* Blurred background image */}
      <div className="absolute inset-0 -z-10 overflow-hidden bg-neutral-600">
        <Image
          unoptimized={true}
          loading="eager"
          priority
          fill
          src={imageUrl}
          alt="blurred background"
          className="object-cover scale-150 blur-3xl opacity-50"
        />
      </div>
      {renderContent()}
    </div>
  );
};

export default FullAssetViewer;
