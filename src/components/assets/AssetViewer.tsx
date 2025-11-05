"use client"

import { BLOCKCHAIN_MEDIA_PATHS, USER_MEDIA } from "@/constants/clientRoutes";
import { imageSizing } from "@/constants/ui";
import { useBreakpoints } from "@/context/ResponsiveProvider";
import { useImageFallback } from "@/hooks/useImageFallback";
import { BlockchainAssetEntry, isBlockchainAssetEntry, isEntry, UserAssetEntry } from "@/types/entry";
import { BlockchainAssetGalleryItem, isBlockchainAssetGalleryItem, isGalleryItem, UserAssetGalleryItem } from "@/types/galleryItem";
import { isBlockchainImage, isUserImage, MediaCategory } from "@/types/media";
import { getMediaUrl } from "@/utils/media";
import { cn } from "@/utils/ui-utils";
import { BoxIcon, Code2Icon, FullscreenIcon, ImageOffIcon, VideoOffIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FC, useState } from "react";
import VideoViewer from "../media/VideoViewer";
import { AspectRatio } from "../ui/aspect-ratio";
import { LinkButton } from "../ui/button";


type Asset =
  | BlockchainAssetEntry
  | UserAssetEntry
  | BlockchainAssetGalleryItem
  | UserAssetGalleryItem

interface AssetViewerProps {
  asset: Asset
  objectFit?: "object-cover" | "object-contain";
  aspectRatio?: "square" | "media-defined";
  className?: string;
  sizeDivisor?: number;
}

const AssetViewer: FC<AssetViewerProps> = ({
  asset,
  aspectRatio = "media-defined",
  objectFit = "object-contain",
  sizeDivisor = 1,
  className,
}) => {
  const router = useRouter();
  const { isSm, isMd, isLg, isXl, is2Xl} = useBreakpoints();

  const { isLoaded, isLoading, isError, imageUrl, onError, onLoad } =
    useImageFallback({media: asset.media});

  const [videoError, setVideoError] = useState(false);

  const media = asset.media;
  const alt = asset.title || "Asset Image";

  const aspectRatioValue = 
    aspectRatio === "square" ? 1 : media.aspectRatio || 1;

  
  const getWidth = () => {
    // Get base width based on breakpoint
    let baseWidth: number;
    if (is2Xl) baseWidth = imageSizing["2xl"];
    else if (isXl) baseWidth = imageSizing.xl;
    else if (isLg) baseWidth = imageSizing.lg;
    else if (isMd) baseWidth = imageSizing.lg;
    else if (isSm) baseWidth = imageSizing.sm;
    else baseWidth = imageSizing.xs;

    // Account for device pixel ratio for high-DPI displays
    // Cap at 3x to balance quality and file size
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    const maxDpr = 3;
    const effectiveDpr = Math.min(dpr, maxDpr);
    
    return Math.round((baseWidth * effectiveDpr) / sizeDivisor);
  };
  
  const width = getWidth();
  const height = width / aspectRatioValue;

  const isBlockchainAsset = isEntry(asset) && isBlockchainAssetEntry(asset)
    || isGalleryItem(asset) && isBlockchainAssetGalleryItem(asset);

  const isVideo = media.category === MediaCategory.Video;
  
  const isImage = isBlockchainImage(media) || isUserImage(media);

  //video will handle its own loading state
  const isImageLoading = isLoading && isImage;

  const isVideoOrImage = isVideo || isImage;

  const newPagePath = isBlockchainAsset
    ? BLOCKCHAIN_MEDIA_PATHS[asset.blockchain](asset.tokenAddress)
    : USER_MEDIA(asset._id.toString());

  const goToMediaPage = () => {
    router.push(newPagePath);
  };

  const renderContent = () => {
    if (media.category === MediaCategory.Video) {
      if (videoError) return <VideoOffIcon className="size-14" />;

      return (
        <VideoViewer
          src={getMediaUrl(media)}
          onError={() => setVideoError(true)}
          minimalControls
          autoPlay
          loop
        />
      );
    }

    //broken image
    if (isError) return <ImageOffIcon className="size-14" />;

    return (
      <Image
        onClick={goToMediaPage}
        quality={90}
        width={width}
        height={height}
        loading="lazy"
        onError={onError}
        onLoad={onLoad}
        src={imageUrl}
        alt={alt}
        className={cn(
          "w-full transition-opacity duration-200 bg-muted",
          isLoaded ? "opacity-100" : "opacity-0",
          objectFit
        )}
      />
    );
  };

  const renderMediaIcon = () => {
    switch (media.category) {
      case MediaCategory.Vr:
        return <BoxIcon />;
      case MediaCategory.Html:
        return <Code2Icon />;
      default: // Image and Video
        return <FullscreenIcon />;
    }
  };

  return (
    <AspectRatio
      ratio={aspectRatioValue}
      className={cn(
        "relative w-full flex justify-center items-center bg-muted text-muted-foreground rounded-md overflow-hidden group/media",
        isImageLoading && "animate-skeleton-shimmer",
        "shadow-lg",
        className
      )}
    >
      {renderContent()}

      <LinkButton
        href={newPagePath}
        size="icon"
        variant="secondary"
        className={cn(
          isVideoOrImage ? "opacity-0" : "opacity-75",
          isVideo && "opacity-100 md:opacity-0",
          "group-hover/media:opacity-100 transition-opacity duration-200",
          "z-10 absolute top-6 right-6"
        )}
        asChild
      >
        {renderMediaIcon()}
      </LinkButton>
    </AspectRatio>
  );
};

export default AssetViewer;
