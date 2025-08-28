"use client"

import Image from "next/image";
import { AspectRatio } from "../ui/aspect-ratio";
import { FC, useState } from "react";
import { getMediaUrl } from "@/utils/media";
import { BoxIcon, Code2Icon, FullscreenIcon, ImageOffIcon, VideoOffIcon } from "lucide-react";
import { cn } from "@/utils/ui-utils";
import { MediaCategory } from "@/types/media";
import { VideoViewer } from "../media/VideoViewer";
import { LinkButton } from "../ui/button";
import { usePathname, useRouter } from "next/navigation";
import { BlockchainAssetEntry, EntryTypes, UserAssetEntry } from "@/types/entry";
import { BLOCKCHAIN_MEDIA_PATHS, RETURN_QUERY_PARAM, USER_MEDIA } from "@/constants/clientRoutes";
import { getReturnKey } from "@/utils/navigation";
import { useImageFallback } from "@/hooks/useImageFallback";

interface AssetViewerProps {
  asset: BlockchainAssetEntry | UserAssetEntry
  objectFit?: "object-cover" | "object-contain";
  aspectRatio?: "square" | "media-defined";
}

const AssetViewer: FC<AssetViewerProps> = ({
  asset,
  aspectRatio = "media-defined",
  objectFit = "object-contain",
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoaded, isLoading, isError, imageUrl, onError, onLoad } =
    useImageFallback(asset.media);
  
  const [videoError, setVideoError] = useState(false);


  const media = asset.media;
  const alt = asset.title || "Asset Image";

  const aspectRatioValue = aspectRatio === "square"
    ? 1
    : (media.aspectRatio || 1);
  
  const isBlockchainAsset = asset.entryType === EntryTypes.BlockchainAsset;

  const isVideoOrImage = media.category === MediaCategory.Video || media.category === MediaCategory.Image;
  const basePath = isBlockchainAsset
    ? BLOCKCHAIN_MEDIA_PATHS[asset.blockchain](asset.tokenAddress)
    : USER_MEDIA(asset._id.toString());
  
  const returnKey = getReturnKey(pathname);
  const newPagePath = `${basePath}?${RETURN_QUERY_PARAM}=${returnKey}`;

  const goToExplorer = () => { 
    router.push(newPagePath);
  }

  const renderContent = () => {
    if (media.category === MediaCategory.Video) {
      if (videoError) return <VideoOffIcon className="min-h-14 min-w-14" />;

      return (
        <VideoViewer
          src={getMediaUrl(media)}
          poster={imageUrl}
          onError={() => setVideoError(true)}
        />
      );
    }

    //broken image
    if (isError) return <ImageOffIcon className="min-h-14 min-w-14" />;

    return (
      <Image
        onClick={goToExplorer}
        unoptimized={true} //TODO: optimized images: for paying users
        loading="lazy"
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 75vw, 800px"
        onError={onError}
        onLoad={onLoad}
        src={imageUrl}
        alt={alt}
        className={cn(
          "w-full transition-opacity duration-200",
          isLoaded ? "opacity-100" : "opacity-0",
          objectFit
        )}
      />
    );
  };

  const renderMediaIcon = () => {
    switch (media.category) {
      case MediaCategory.Vr:
        return <BoxIcon />
      case MediaCategory.Html:
        return <Code2Icon />;
      default: // Image and Video
        return <FullscreenIcon />;
    }
  }


  return (
    <AspectRatio
      ratio={aspectRatioValue}
      className={cn(
        "relative w-full flex justify-center items-center bg-muted text-muted-foreground rounded-md overflow-hidden group/media",
        isLoading && "animate-skeleton-shimmer",
        "shadow-md"
      )}
    >

      {renderContent()}

      <LinkButton
        href={newPagePath}
        size="icon"
        variant="secondary"
        className={cn(
          isVideoOrImage ? "opacity-0" : "opacity-75",
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
