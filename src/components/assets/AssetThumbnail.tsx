import Image from "next/image";
import { AspectRatio } from "../ui/aspect-ratio";
import { FC } from "react";
import { ImageOffIcon } from "lucide-react";
import { cn } from "@/utils/ui-utils";
import { ParsedBlockChainAsset } from "@/types/asset";
import { UserAssetEntry } from "@/types/entry";
import { useImageFallback } from "@/hooks/useImageFallback";

interface AssetThumbnailProps {
  asset: ParsedBlockChainAsset | UserAssetEntry;
  onLoad?: (imageElement: HTMLImageElement) => void;
  objectFit?: "object-cover" | "object-contain";
  size?: "sm" | "md";
}

const AssetThumbnail: FC<AssetThumbnailProps> = ({
  asset,
  onLoad,
  objectFit = "object-cover",
  size = "md",
}) => {
  const {
    isLoaded,
    isLoading,
    isError,
    imageUrl,
    onError,
    onLoad: onImageLoad,
  } = useImageFallback(asset.media);

  const rounding = size === "sm" ? "rounded-sm" : "rounded-md";

  const handleLoad = (el: HTMLImageElement) => {
    onImageLoad();
    if (onLoad) onLoad(el);
  };

  const renderContent = () => {
    //broken image
    if (isError) return <ImageOffIcon className="min-h-14 min-w-14" />;

    return (
      <Image
        fill
        unoptimized
        loading="lazy"
        onError={onError}
        onLoadingComplete={handleLoad}
        src={imageUrl}
        alt={asset.title || "Asset Thumbnail"}
        className={cn(
          "w-full transition-opacity duration-200",
          isLoaded ? "opacity-100" : "opacity-0",
          objectFit
        )}
      />
    );
  };

  return (
    <AspectRatio
      ratio={1}
      className={cn(
        "flex justify-center items-center bg-muted text-muted-foreground overflow-hidden",
        rounding,
        isLoading && "animate-skeleton-shimmer"
      )}
    >
      {renderContent()}
    </AspectRatio>
  );
};

export default AssetThumbnail;