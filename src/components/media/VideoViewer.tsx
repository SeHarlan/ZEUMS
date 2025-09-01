"use client";

import { 
  FC,
  MouseEvent,
  useCallback, 
  useEffect, 
  useRef, 
  useState 
} from "react";
import { Play, Pause, Volume2, VolumeX, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/ui-utils";
import { P } from "@/components/typography/Typography";
import { Slider } from "@/components/ui/slider";

// Type definitions for fullscreen methods
interface FullscreenVideoElement extends HTMLVideoElement {
  webkitRequestFullscreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
}

interface FullscreenDocument extends Document {
  webkitExitFullscreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
}

interface VideoViewerProps {
  src: string;
  poster?: string;
  containerClassName?: string;
  className?: string;
  controls?: boolean;
  minimalControls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  onLoadedMetadata?: (video: HTMLVideoElement) => void;
  onError?: (error: Event) => void;
}

const VideoViewer: FC<VideoViewerProps> = ({
  src,
  poster,
  containerClassName,
  className,
  controls = true,
  minimalControls = false,
  autoPlay = false,
  muted = false,
  loop = false,
  onLoadedMetadata,
  onError,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let bufferingTimeout: NodeJS.Timeout;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      onLoadedMetadata?.(video);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
    };

    const handleWaiting = () => {
      // Clear any existing timeout
      clearTimeout(bufferingTimeout);
      // Add a small delay before showing loading state
      bufferingTimeout = setTimeout(() => {
        setIsLoading(true);
      }, 333);
    };

    const handlePlaying = () => {
      clearTimeout(bufferingTimeout);
      setIsLoading(false);
    };

    const handleCanPlayThrough = () => {
      // Only hide loading if we're actually playing or ready to play
      clearTimeout(bufferingTimeout);
      if (!video.paused || video.readyState >= 3) {
        setIsLoading(false);
      }
    };

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = (e: Event) => {
      setIsLoading(false);
      onError?.(e);
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("canplaythrough", handleCanPlayThrough);
    video.addEventListener("loadstart", handleLoadStart);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("canplaythrough", handleCanPlayThrough);
      video.removeEventListener("loadstart", handleLoadStart);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("error", handleError);
    };
  }, [onLoadedMetadata, onError]);

  const togglePlay = async (
    e: MouseEvent<HTMLVideoElement | HTMLButtonElement>
  ) => {
    e.preventDefault();

    const video = videoRef.current;
    if (!video) return;

    try {
      if (isPlaying) {
        video.pause();
      } else {
        await video.play();
      }
    } catch (error) {
      // Handle AbortError and other play errors silently
      if (error instanceof Error && error.name !== "AbortError") {
        console.warn("Video play error:", error);
      }
    }
  };

  const toggleMute = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = value[0];
    video.volume = newVolume;
    setVolume(newVolume);

    if (newVolume === 0) {
      video.muted = true;
      setIsMuted(true);
    } else {
      video.muted = false;
      setIsMuted(false);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const toggleFullscreen = useCallback(() => {
    if (!videoRef.current) return;

    const video = videoRef.current as FullscreenVideoElement;
    const doc = document as FullscreenDocument;

    if (!document.fullscreenElement) {
      // Enter fullscreen
      if (video.requestFullscreen) {
        video.requestFullscreen();
      } else if (video.webkitRequestFullscreen) {
        video.webkitRequestFullscreen();
      } else if (video.msRequestFullscreen) {
        video.msRequestFullscreen();
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
      }
    }
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div
      className={cn(
        "relative group/video w-full h-full flex justify-center items-center",
        isLoading && "animate-skeleton-shimmer",
        containerClassName
      )}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onTouchEnd={() => setShowControls((prev) => !prev)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        playsInline
        className={cn(
          "w-full",
          "object-contain transition-opacity duration-500",
          isLoading ? "opacity-33" : "opacity-100",
          className
        )}
        onClick={(e) => {
          if(e.detail < 1) togglePlay(e)
        }}
      />

      {(controls || minimalControls) && (
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-200",
            showControls
              ? "opacity-100"
              : "opacity-0 group-hover/video:opacity-100"
          )}
          onTouchEnd={(e) => {
            e.stopPropagation();
          }}
        >
          {/* Progress bar */}
          <div className={cn("p-4", minimalControls ? "hidden" : "block")}>
            <Slider
              value={[currentTime]}
              max={duration}
              reversed
              step={0.1}
              onValueChange={handleSeek}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="secondary" size="icon" onClick={togglePlay}>
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>

              <Button variant="secondary" size="icon" onClick={toggleMute}>
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>

              <div className={cn("w-20")}>
                <Slider
                  reversed
                  value={[volume]}
                  max={1}
                  step={0.1}
                  onValueChange={handleVolumeChange}
                />
              </div>
            </div>

            <div
              className={cn(
                "text-white text-sm",
                minimalControls ? "hidden" : "block",
                "flex items-center gap-4"
              )}
            >
              <P>
                {formatTime(currentTime)} / {formatTime(duration)}
              </P>
              <Button
                variant="secondary"
                size="icon"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoViewer;
