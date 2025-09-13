import { FC, useState } from "react";
import { Card, CardContent, CardFooter } from "../ui/card";
import { H4 } from "../typography/Typography";
import { cn } from "@/utils/ui-utils";
import MediaThumbnail from "../media/MediaThumbnail";
import { ParsedBlockChainAsset } from "@/types/asset";
import { useAspectRatio } from "@/context/AspectRatioProvider";
import { getImageAspectRatio, getMediaUrl, getVideoAspectRatio } from "@/utils/media";
import { ImageVariant, MediaCategory } from "@/types/media";
import { handleClientError } from "@/utils/handleError";
import { toast } from "sonner";
import { BoxIcon, Code2Icon } from "lucide-react";
import { BANNER_RATIO } from "../timeline/BannerImage";

interface AssetThumbnailCardProps {
  asset: ParsedBlockChainAsset;
  className?: string;
  onClick?: (aspectRatio: number) => void;
  imageVariant?: ImageVariant;
}

const AssetThumbnailCard: FC<AssetThumbnailCardProps> = ({
  asset,
  className,
  onClick,
  imageVariant = "default",
}) => {

  const { setAspectRatio, getAspectRatio } = useAspectRatio();
  const [loading, setLoading]  = useState(false)
  
  const handleLoad = (imageElement: HTMLImageElement) => { 
    const ratioExists = !!getAspectRatio(asset);

    //video aspect ratios are only fetched once clicked
    if (asset.media.category === MediaCategory.Video || ratioExists) return;

    const ratio = getImageAspectRatio(imageElement);
    setAspectRatio(asset, ratio);
  }

  const handleClick = () => {
    if (loading) return;
    // If the selected asset is a video, we want to load the video metadata to get the aspect ratio before allowing the click to go through
    const aspectRatio = getAspectRatio(asset);
    if (aspectRatio) {
      onClick?.(aspectRatio);
      return;
    }
    //no aspect ratio and no aspectRatio (meaning image never loaded)
    if (asset.media.category !== MediaCategory.Video) {
      toast.error("Failed to load image metadata.");
      return
    }

    const videoElement = document.createElement("video");
  
    videoElement.preload = "metadata"; // Only load metadata
    videoElement.muted = true; // Prevent autoplay issues
    videoElement.crossOrigin = "anonymous";

    //prevent new reloads and error catches once the first src has been tried and cleaned up
    let isProcessed = false;

    const cleanup = () => {
      isProcessed = true;
      setLoading(false)
      videoElement.src = "" //clear to stop loading
      videoElement.remove(); // Remove from memory
    };
    
    videoElement.onloadedmetadata = () => {
      if (isProcessed) return;
      const ratio = getVideoAspectRatio(videoElement);
      setAspectRatio(asset, ratio); //cache incase the video asset is unclicked and reclicked
      onClick?.(ratio); //send immediately on click for main function
      cleanup(); // Stop here, don't load video data
    };

    videoElement.onerror = (e) => {
      if(isProcessed) return
      cleanup();
      toast.error("Failed to load video metadata.");
      handleClientError({
        error: e,
        location: "AssetThumbnailCard_handleClick",
      });
    };

    videoElement.src = getMediaUrl(asset.media);
    setLoading(true)
  }

  const useIcon = asset.media.category === MediaCategory.Vr || asset.media.category === MediaCategory.Html;

  const renderMediaIcon = () => {
    switch (asset.media.category) {
      case MediaCategory.Vr:
        return <BoxIcon  className="size-5"/>;
      case MediaCategory.Html:
        return <Code2Icon className="size-5"/>;
      default: // Image and Video
        return null;
    }
  };

  const profileImageProps = {
    className: "border-3",
    objectFit: "object-cover" as const,
    rounding: "rounded-full" as const,
  }
  const bannerImageProps = {
    ratio: BANNER_RATIO,
    objectFit: "object-cover" as const,
    rounding: "rounded-md" as const,
  }

  const propsMap = {
    "profile": profileImageProps,
    "banner": bannerImageProps,
    "default": {},
  }

  return (
    <Card
      className={cn(
        "p-0 overflow-hidden cursor-pointer gap-1 rounded-lg",
        className
      )}
      onClick={handleClick}
    >
      <CardContent className="p-0 relative">
        {useIcon && (
          <div className="z-10 absolute top-3 right-3 bg-muted p-1 rounded-full shadow-md text-muted-foreground">
            {renderMediaIcon()}
          </div>
        )}
        <MediaThumbnail
          media={asset.media}
          alt={asset.title}
          onLoad={handleLoad}
          {...propsMap[imageVariant]}
        />
      </CardContent>

      <CardFooter className="pb-1 px-3">
        <H4 className="text-lg font-semibold line-clamp-1">{asset.title}</H4>
      </CardFooter>
    </Card>
  );
};  

export default AssetThumbnailCard;

