"use client";

import { FC, useRef, useState, useEffect, MouseEvent } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/ui-utils";
import { Slider } from "../ui/slider";

interface VideoViewerProps {
  src: string;
  poster?: string;
  className?: string;
  containerClassName?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  minimalControls?: boolean; // Optional prop for minimal controls
  onLoadedMetadata?: (video: HTMLVideoElement) => void;
  onError?: (error: Event) => void;
}

export const VideoViewer: FC<VideoViewerProps> = ({
  src,
  poster,
  containerClassName,
  className,
  autoPlay = true,
  muted = true,
  loop = true,
  controls = true,
  minimalControls = false, // Use this prop to toggle minimal controls
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

  return (
    <div
      className={cn(
        "relative group/video w-full h-full flex justify-center items-center",
        isLoading  && "animate-skeleton-shimmer",
        containerClassName,
      )}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
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
          "object-cover transition-opacity duration-300",
          isLoading ? "opacity-33" : "opacity-100",
          className
        )}
        onClick={togglePlay}
      />

      {(controls || minimalControls) && (
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-200",
            showControls
              ? "opacity-100"
              : "opacity-0 group-hover/video:opacity-100"
          )}
        >
          {/* Progress bar */}
          {/* <Slider
            value={[currentTime]}
            max={duration}
            step={0.1}
            onValueChange={handleSeek}
            className={cn("mb-2", minimalControls ? "hidden" : "block")}
          /> */}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="secondary"
                size="icon"
                onClick={togglePlay}
                // className="text-white hover:bg-white/20"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>

              <Button
                variant="secondary"
                size="icon"
                onClick={toggleMute}
                // className="text-white hover:bg-white/20"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>

              <div className={cn("w-20", minimalControls ? "hidden" : "block")}>
                <Slider
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
                minimalControls ? "hidden" : "block"
              )}
            >
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
