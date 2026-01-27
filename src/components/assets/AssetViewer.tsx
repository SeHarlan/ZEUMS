"use client"

import { BLOCKCHAIN_MEDIA_PATHS, USER_MEDIA } from "@/constants/clientRoutes";
import { imageSizing, MAX_SIZE_DIVISOR, MD_BREAKPOINT } from "@/constants/ui";
import { UploadCategory } from "@/constants/uploadCategories";
import { useBreakpoints } from "@/context/ResponsiveProvider";
import { useImageFallback } from "@/hooks/useImageFallback";
import { BlockchainAssetEntry, isBlockchainAssetEntry, isEntry, UserAssetEntry } from "@/types/entry";
import { BlockchainAssetGalleryItem, isBlockchainAssetGalleryItem, isGalleryItem, UserAssetGalleryItem } from "@/types/galleryItem";
import { BlobUrlBuilderProps, isBlockchainImage, isUserImage, MediaCategory } from "@/types/media";
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
  blobUrlBuilderProps?: BlobUrlBuilderProps;
}

const AssetViewer: FC<AssetViewerProps> = ({
  asset,
  aspectRatio = "media-defined",
  objectFit = "object-contain",
  /** caps at MAX_SIZE_DIVISOR to align with next config device sizes */
  sizeDivisor = 1,
  className,
  blobUrlBuilderProps,
}) => {
  console.log("🚀 ~ AssetViewer ~ asset:", asset)
  const router = useRouter();
  const { isMd, isLg, isXl, is2Xl } = useBreakpoints();

  const { isLoaded, isLoading, isError, imageUrl, onError, onLoad } =
    useImageFallback({ media: asset.media, blobUrlBuilderProps });

  const [videoError, setVideoError] = useState(false);

  const media = asset.media;
  const alt = asset.title || "Asset Image";

  const aspectRatioValue =
    aspectRatio === "square" ? 1 : media.aspectRatio || 1;

  const cappedDivisor = Math.max(1, Math.min(sizeDivisor, MAX_SIZE_DIVISOR));

  const getWidth = () => {
    // Get base width based on breakpoint
    let baseWidth: number;
    if (is2Xl) baseWidth = imageSizing["2xl"];
    else if (isXl) baseWidth = imageSizing.xl;
    else if (isLg) baseWidth = imageSizing.lg;
    else if (isMd) baseWidth = imageSizing.md;
    else baseWidth = imageSizing.sm;

    //grids should shrink to single column at md breakpoint
    if (isMd) return Math.round(baseWidth / cappedDivisor);
    else return baseWidth;
  };

  const getSizes = () => {
    if (cappedDivisor === 1 || !isMd) {
      return "100vw"; // Full width
    }

    const percentage = 100 / cappedDivisor;
    return `(min-width: ${MD_BREAKPOINT}px) ${percentage}vw`;
  };

  const width = getWidth();
  const height = width / aspectRatioValue;

  const isBlockchainAsset =
    (isEntry(asset) && isBlockchainAssetEntry(asset)) ||
    (isGalleryItem(asset) && isBlockchainAssetGalleryItem(asset));

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
      if (videoError) return <VideoOffIcon className="size-14 text-border" />;

      let videoBlobUrlBuilderProps: BlobUrlBuilderProps | undefined;
      let thumbnailBlobUrlBuilderProps: BlobUrlBuilderProps | undefined;

      if (blobUrlBuilderProps) {
        videoBlobUrlBuilderProps = {
          userId: blobUrlBuilderProps.userId,
          category: UploadCategory.UPLOADED_VIDEO,
        };
        thumbnailBlobUrlBuilderProps = {
          userId: blobUrlBuilderProps.userId,
          category: UploadCategory.UPLOADED_THUMBNAIL,
        };
      }

      return (
        <VideoViewer
          media={media}
          src={getMediaUrl(media, videoBlobUrlBuilderProps)}
          onError={() => setVideoError(true)}
          minimalControls
          autoPlay
          loop
          thumbnailBlobUrlBuilderProps={thumbnailBlobUrlBuilderProps}
        />
      );
    }

    //broken image
    if (isError) return <ImageOffIcon className="size-14 text-muted-border" />;

    return (
      <Image
        onClick={goToMediaPage}
        quality={90}
        width={width}
        height={height}
        sizes={getSizes()}
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
        "relative w-full flex justify-center items-center bg-muted rounded-md overflow-hidden group/media",
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
