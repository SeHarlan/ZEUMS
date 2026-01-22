"use client"

import { useImageFallback } from "@/hooks/useImageFallback";
import { ParsedBlockChainAsset } from "@/types/asset";
import { UserAssetEntry } from "@/types/entry";
import { BlobUrlBuilderProps, isBlockchainImage, isUserImage, MediaCategory } from "@/types/media";
import { getMediaUrl } from "@/utils/media";
import { cn } from "@/utils/ui-utils";
import {
  ImageOffIcon,
  MonitorOffIcon
} from "lucide-react";
import Image from "next/image";
import { FC, useState } from "react";
import HtmlViewer from "../media/HtmlViewer";
import ModelViewer from "../media/ModelViewer";
import VideoViewer from "../media/VideoViewer";

interface FullAssetViewerProps {
  asset: ParsedBlockChainAsset | UserAssetEntry;
  className?: string;
  blobUrlBuilderProps?: BlobUrlBuilderProps;
}

const FullAssetViewer: FC<FullAssetViewerProps> = ({
  asset,
  className,
  blobUrlBuilderProps,
}) => {
  const { isLoaded, isLoading, isError, imageUrl, onError, onLoad } =
    useImageFallback({media: asset.media, blobUrlBuilderProps});

  const [mediaError, setMediaError] = useState(false);

  const media = asset.media;
  const alt = asset.title || "Asset Media";

  const isImage = isBlockchainImage(media) || isUserImage(media);

  //other media types handle their own loading states
  const isImageLoading = isLoading && isImage;

  const handleMediaError = () => {
    setMediaError(true);
  };

  const renderContent = () => {
    if (mediaError) {
      return  <MonitorOffIcon className="size-14 text-muted-border" />;
    }

    if (isError && isImage) {
      return <ImageOffIcon className="size-14 text-muted-border" />;
    }

    switch (media.category) {
      case MediaCategory.Video:
        return (
          <VideoViewer
            media={media}
            src={getMediaUrl(media)}
            autoPlay
            loop
            controls
            onError={handleMediaError}
            className="max-h-screen w-fit"
            containerClassName="h-fit w-fit"
            noLoadingAnimation={true}
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
            quality={100}
            loading="eager"
            priority
            fill
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
      <div className="absolute inset-0 -z-10 overflow-hidden bg-neutral-500">
        <Image
          quality={10}
          loading="eager"
          priority
          fill
          src={imageUrl}
          alt="blurred background"
          aria-hidden="true"
          className={cn(
            "object-cover",
            !mediaError && "scale-125 blur-3xl opacity-75"
          )}
        />
      </div>
    </div>
  );
};

export default FullAssetViewer;
