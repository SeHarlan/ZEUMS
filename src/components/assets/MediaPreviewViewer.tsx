import { isBlockchainImage, isUserImage, MediaCategory, MediaType } from "@/types/media";
import { FC, useState } from "react";
import { VideoViewer } from "../media/VideoViewer";
import { getImageUrlSources, getMediaUrl } from "@/utils/media";
import HtmlViewer from "../media/HtmlViewer";
import ModelViewer from "../media/ModelViewer";
import { MonitorOffIcon } from "lucide-react";
import { cn } from "@/utils/ui-utils";

interface MediaPreviewViewerProps {
  media: MediaType
  onVideoLoad?: (videoElement: HTMLVideoElement) => void;
  className?: string;
}

const MediaPreviewViewer: FC<MediaPreviewViewerProps> = ({
  media,
  onVideoLoad,
  className
}) => {

  const [isError, setIsError] = useState(false);

  const handleError = () => {
    setIsError(true);
  }

  const renderContent = () => {     
    if (isBlockchainImage(media) || isUserImage(media)) return null;

    if (isError) { 
      return <MonitorOffIcon className="min-h-14 min-w-14" />
    }

    const mediaUrl = getMediaUrl(media);
    const imageUrl = getImageUrlSources(media)[0];

    switch (media.category) { 
      case MediaCategory.Video:
        return (
          <VideoViewer
            src={mediaUrl}
            poster={imageUrl}
            controls={false}
            minimalControls
            onLoadedMetadata={onVideoLoad}
            onError={handleError}
          />
        );
      case MediaCategory.Html:
        return (
          <HtmlViewer
            src={mediaUrl}
            onError={handleError}
          />
        )
      case MediaCategory.Vr:
        return (
          <ModelViewer
            src={mediaUrl}
            poster={imageUrl}
            onError={handleError}
          />
        )
      default:
        return null;
    }

  }

  return (
    <div
      className={cn(
        "rounded-md overflow-hidden",
        "flex justify-center items-center w-full h-full",
        "bg-muted text-muted-foreground",
        className
      )}
    >
      {renderContent()}
    </div>
  );
}

export default MediaPreviewViewer;