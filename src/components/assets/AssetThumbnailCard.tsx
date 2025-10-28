import { BANNER_RATIO } from "@/constants/ui";
import { useAspectRatio } from "@/context/AspectRatioProvider";
import { ParsedBlockChainAsset } from "@/types/asset";
import { ImageVariant, MediaCategory } from "@/types/media";
import { handleClientError } from "@/utils/handleError";
import { getImageAspectRatio, getMediaUrl } from "@/utils/media";
import { cn } from "@/utils/ui-utils";
import { REQUEST_ABORTED_ERROR, REQUEST_FULL_ERROR, videoMetadataQueue } from "@/utils/videoMetadataPool";
import { BoxIcon, Code2Icon } from "lucide-react";
import { FC, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import LoadingSpinner from "../general/LoadingSpinner";
import MediaThumbnail from "../media/MediaThumbnail";
import { P } from "../typography/Typography";
import { Card, CardContent, CardFooter } from "../ui/card";

interface AssetThumbnailCardProps {
  asset: ParsedBlockChainAsset;
  className?: string;
  onClick?: (aspectRatio: number) => void;
  imageVariant?: ImageVariant;
  setOptimisticClick?: (optimisticClick: boolean) => void;
  optimisticClick?: boolean;
}

const AssetThumbnailCard: FC<AssetThumbnailCardProps> = ({
  asset,
  className,
  onClick,
  imageVariant = "default",
  setOptimisticClick,
  optimisticClick,
}) => {
  const { setAspectRatio, getAspectRatio } = useAspectRatio();
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef<(() => void) | null>(null);
  const [error, setError] = useState(false)
  
  const handleLoad = (imageElement: HTMLImageElement) => { 
    setError(false);
    const ratioExists = !!getAspectRatio(asset);

    //video aspect ratios are only fetched once clicked
    if (asset.media.category === MediaCategory.Video || ratioExists) return;

    const ratio = getImageAspectRatio(imageElement);
    setAspectRatio(asset, ratio);
    if (optimisticClick) {
      onClick?.(ratio);
      setOptimisticClick?.(false);
    }
  }

  const handleError = () => {
    if (optimisticClick) {
      toast.error("Failed to load selected image.");
    }
    
    setError(true);
    handleAbort();
  }

  const handleAbort = () => {
    setOptimisticClick?.(false);
    setLoading(false);

    if (abortControllerRef.current) {
      abortControllerRef.current();
      abortControllerRef.current = null;
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current();
      }
    };
  }, []);

  const handleClick = async () => {
    if (loading) {
      handleAbort();
      return;
    }
    if (error) {
      const assetType = asset.media.category === MediaCategory.Video ? "video" : "image";
      toast.error(`Failed to load selected ${assetType}.`);
      return;
    }

    // If the selected asset is a video, we want to load the video metadata to get the aspect ratio before allowing the click to go through
    const aspectRatio = getAspectRatio(asset);
    if (aspectRatio) {
      onClick?.(aspectRatio);
      handleAbort();
      return;
    }
    
    setLoading(true);
    setOptimisticClick?.(true);

    //no aspect ratio and no aspectRatio (meaning image hasnt loaded yet)
    if (asset.media.category !== MediaCategory.Video) {
      // if not using optimistic click show an error
      if (setOptimisticClick === undefined) {
        toast.error("Failed to load image.");
      }

      //if optimistic wait for image to load then handle click
      return;
    }

    //get video metadata
    try {
      const { promise, abort } = videoMetadataQueue.getVideoMetadata(getMediaUrl(asset.media));
      abortControllerRef.current = abort;
      
      const ratio = await promise;
      setAspectRatio(asset, ratio);
      onClick?.(ratio);
    } catch (error) {
      // Don't show error if it was aborted
      if (error instanceof Error && error.message === REQUEST_ABORTED_ERROR) {
        return;
      }

      if (error instanceof Error && error.message === REQUEST_FULL_ERROR) {
        toast.info("Video loading queue is full", {
          description: "Please try again shortly",
        });
        return;
      }

      setError(true);
      toast.error("Failed to load video.");
      handleClientError({
        error,
        location: "AssetThumbnailCard_handleClick",
      });
    } finally {
      handleAbort();
      setLoading(false);
      abortControllerRef.current = null;
    }
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
        <LoadingSpinner
          className={cn(
            "z-20 absolute-center transition-all duration-500 fill-mode-forwards",
            !loading && "opacity-0",
            optimisticClick
              ? "animate-in zoom-in-90 fade-in-0"
              : "animate-out zoom-out-90 fade-out-0"
          )}
        />
        {useIcon && (
          <div className="z-10 absolute top-3 right-3 bg-muted p-1 rounded-full shadow-md text-muted-foreground">
            {renderMediaIcon()}
          </div>
        )}
        <MediaThumbnail
          media={asset.media}
          alt={asset.title}
          onLoad={handleLoad}
          onError={handleError}
          {...propsMap[imageVariant]}
        />
      </CardContent>

      <CardFooter className="pb-1 px-3">
        <P className="text-lg font-semibold line-clamp-1">{asset.title}</P>
      </CardFooter>
    </Card>
  );
};  

export default AssetThumbnailCard;

