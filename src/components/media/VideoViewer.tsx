"use client";

import { P } from "@/components/typography/Typography";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { MediaType } from "@/types/media";
import { cn } from "@/utils/ui-utils";
import { Maximize2, Minimize2, PauseIcon, PlayIcon, VideoIcon, Volume2Icon, VolumeXIcon } from "lucide-react";
import {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import MediaThumbnail from "./MediaThumbnail";

// Type definitions for fullscreen methods
interface FullscreenVideoElement extends HTMLVideoElement {
  webkitRequestFullscreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
  webkitEnterFullscreen?: () => Promise<void>; // iOS Safari
  webkitEnterFullScreen?: () => Promise<void>; // Older iOS Safari (capitalization varies)
}
interface FullscreenDocument extends Document {
  webkitExitFullscreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
  webkitFullscreenElement?: Element;
  msFullscreenElement?: Element;
}

const mimeTypes: Record<string, string> = {
  mp4: "video/mp4",
  webm: "video/webm",
  ogg: "video/ogg",
  ogv: "video/ogg",
  avi: "video/x-msvideo",
  mov: "video/quicktime",
  wmv: "video/x-ms-wmv",
};

const BUFFERING_DELAY = 1_000; //time before buffering message shows
const LOADING_TIMEOUT = 30_000; //30 seconds - before before showing long load time message
interface VideoViewerProps {
  media?: MediaType;
  src: string;
  poster?: string;
  containerClassName?: string;
  className?: string;
  controls?: boolean;
  minimalControls?: boolean;
  autoPlay?: boolean;
  /**forced to true when autoPlay is true */
  muted?: boolean;
  loop?: boolean;
  onLoadedMetadata?: (video: HTMLVideoElement) => void;
  onError?: ((e: unknown) => void);
  noLoadingAnimation?: boolean;
}

const VideoViewer: FC<VideoViewerProps> = ({containerClassName, noLoadingAnimation = false, ...props}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const showLoadingState = isLoading || isBuffering;

  const media = props.media;

  const setIsLoadingCallback = useCallback((isLoading: boolean) => {
    setIsLoading(isLoading);
  }, []);

  const setIsBufferingCallback = useCallback((isBuffering: boolean) => {
    setIsBuffering(isBuffering);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative group/video w-full h-full flex justify-center items-center",
        showLoadingState  && !noLoadingAnimation && "animate-skeleton-shimmer",
        containerClassName
      )}
    >
      {isLoading  && (
        <div className="absolute inset-0 ">
          <div className="absolute-center bg-muted-blur rounded-sm p-2 z-20 relative animate-pulse">
            <VideoIcon className="size-6 text-muted-foreground" />
          </div>

          {media?.aspectRatio && (
            <MediaThumbnail
              media={media}
              alt={"video thumbnail"}
              className="opacity-75 bg-transparent"
              ratio={media.aspectRatio}
              noPadding
            />
          )}
        </div>
      )}
      <VideoViewerCore
        {...props}
        containerRef={containerRef}
        isLoading={isLoading}
        isBuffering={isBuffering}
        setIsLoading={setIsLoadingCallback}
        setIsBuffering={setIsBufferingCallback}
      />
    </div>
  );
};

interface VideoViewerCoreProps extends Omit<VideoViewerProps, "containerClassName"> {
  isLoading: boolean;
  isBuffering: boolean;
  setIsLoading: (isLoading: boolean) => void;
  setIsBuffering: (isBuffering: boolean) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const VideoViewerCore: FC<VideoViewerCoreProps> = ({
  src,
  poster,
  className,
  controls = false,
  minimalControls,
  autoPlay = true,
  muted = true,
  loop = true,
  onLoadedMetadata,
  onError,
  isLoading,
  isBuffering,
  setIsLoading,
  setIsBuffering,
  containerRef,
}) => {
  const defaultMuted = autoPlay ? true : muted;

  const controlsRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(defaultMuted);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [failedToPlayMessage, setFailedToPlayMessage] = useState<null | "autoplay" | "loading-timeout" | "error">(null);

  //these prevent unneeded event listeners and other checks
  const useCurrentTime = controls && !minimalControls;
  const isSimpleVideo = !controls && !minimalControls;

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const mimeType = useMemo(() => {
    const extMatch = src.match(/\?ext=([^&]+)/)?.[1];
    if (!extMatch) return undefined; //let browser determine the mime type

    const extension = extMatch.toLowerCase();

    
    return mimeTypes[extension];
  }, [src]);

  const handleAutoplayError = useCallback((error: unknown) => { 
    console.info("Autoplay blocked by browser policy:", error);
    // Render a big play button that calls togglePlay when clicked
    setFailedToPlayMessage("autoplay");
  }, []);

  const handleVideoPlayError = useCallback((error: unknown) => {
    setIsLoading(false);
    setIsPlaying(false);
    setIsBuffering(false);

    // More comprehensive autoplay error detection
    const isAutoplayError = error &&
      typeof error === "object" &&
      "name" in error &&
      typeof error.name === "string" &&
      (error.name === "NotAllowedError" || 
       error.name === "AbortError" ||
        error.name === "NotSupportedError");
    
    // Cleanly handle autoplay errors by checking for various autoplay-related errors
    if (isAutoplayError) {
      handleAutoplayError(error);
    } else {
      console.error("Video play error:", error);
      setFailedToPlayMessage("error");
      onError?.(error);
    }
  }, [onError, handleAutoplayError, setIsLoading, setIsBuffering]);

  const handleLoadingTimeout = useCallback(() => {
    console.warn("Video loading timeout");
    setIsLoading(false);
    setIsBuffering(false);
    setIsPlaying(false);
    setFailedToPlayMessage("loading-timeout");
  }, [setIsLoading, setIsBuffering]);

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    setFailedToPlayMessage(null);

    if (isPlaying) {
      video.pause();
    } else {
      await video.play().catch(handleVideoPlayError);
    }
  };

  const toggleMute = () => {
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

  const toggleFullscreen = useCallback(() => {
    const video = videoRef.current as FullscreenVideoElement;
    if (!video || isSimpleVideo) return;

    const doc = document as FullscreenDocument;

    // Check if we're in fullscreen mode
    const isInFullscreen = !!(
      document.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.msFullscreenElement
    );

    if (!isInFullscreen) {
      // Enter fullscreen - try iOS specific method first
      if (!!video.webkitEnterFullscreen) {
        // iOS Safari specific method
        video
          .webkitEnterFullscreen()
          .catch((err) => console.warn("iOS fullscreen failed:", err));
      } else if (!!video.webkitEnterFullScreen) {
        // Older iOS Safari (different capitalization)
        video
          ?.webkitEnterFullScreen()
          .catch((err) => console.warn("iOS fullscreen failed:", err));
      } else if (!!video.requestFullscreen) {
        // Standard method
        video
          .requestFullscreen()
          .catch((err) => console.warn("Fullscreen failed:", err));
      } else if (!!video.webkitRequestFullscreen) {
        // Webkit browsers
        video.webkitRequestFullscreen();
      } else if (!!video.msRequestFullscreen) {
        // IE/Edge
        video.msRequestFullscreen();
      } else {
        console.warn("Fullscreen API not supported");
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document
          .exitFullscreen()
          .catch((err) => console.warn("Exit fullscreen failed:", err));
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
      }
    }
  }, [isSimpleVideo]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let bufferingTimeout: NodeJS.Timeout;
    let loadingTimeout: NodeJS.Timeout;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      onLoadedMetadata?.(video);
    };

    const handleLoadStart = () => {
      setFailedToPlayMessage(null);
      setIsBuffering(false);
      setIsLoading(true);
      // Set a timeout to prevent infinite loading (especially on mobile)
      clearTimeout(loadingTimeout);
      loadingTimeout = setTimeout(handleLoadingTimeout, LOADING_TIMEOUT);
    };

    const handleWaiting = () => {
      // Clear any existing timeout
      clearTimeout(bufferingTimeout);
      // Add a small delay before showing loading state
      bufferingTimeout = setTimeout(() => {
        setIsBuffering(true);
      }, BUFFERING_DELAY);
    };

    const handlePlaying = () => {
      clearTimeout(bufferingTimeout);
      clearTimeout(loadingTimeout);
      setFailedToPlayMessage(null);
      setIsBuffering(false);
      setIsLoading(false);
    };

    const handleCanPlayThrough = () => {
      // Ensure loading is hidden when video can play through
      clearTimeout(bufferingTimeout);
      clearTimeout(loadingTimeout);
      setFailedToPlayMessage(null);
      setIsBuffering(false);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handlePlay = () => {
      setIsPlaying(true);
    };
    const handlePause = () => setIsPlaying(false);
    const handleError = (e: Event) => {
      handleVideoPlayError(e);

      const video = e.target as HTMLVideoElement;
      console.error("Video error:", video?.error?.message || "Unknown error");
    };

    //only add event listeners if we need them
    if (useCurrentTime) video.addEventListener("timeupdate", handleTimeUpdate);

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("canplaythrough", handleCanPlayThrough);
    video.addEventListener("loadstart", handleLoadStart);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("error", handleError);

    return () => {
      clearTimeout(bufferingTimeout);
      clearTimeout(loadingTimeout);

      if (useCurrentTime)
        video.removeEventListener("timeupdate", handleTimeUpdate);

      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("canplaythrough", handleCanPlayThrough);
      video.removeEventListener("loadstart", handleLoadStart);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("error", handleError);
    };
  }, [
    defaultMuted,
    onLoadedMetadata,
    onError,
    useCurrentTime,
    autoPlay,
    handleVideoPlayError,
    handleLoadingTimeout,
    setIsBuffering,
    setIsLoading,
  ]);

  // Note: Play/pause based on viewport visibility removed since virtualizer handles mounting/unmounting
  // Videos will auto-play when mounted (if autoPlay is true) and pause when unmounted by the virtualizer
  

  // Listen for fullscreen changes
  useEffect(() => {
    if (isSimpleVideo) return;
    const doc = document as FullscreenDocument;
    const video = videoRef.current;

    const handleFullscreenChange = () => {
      const isInFullscreen =
        document.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.msFullscreenElement;

      // For iOS Safari which doesn't use standard fullscreen events
      const isVideoInFullscreen =
        video &&
        (video as { webkitDisplayingFullscreen?: boolean })
          .webkitDisplayingFullscreen === true;

      setIsFullscreen(!!isInFullscreen || !!isVideoInFullscreen);
    };

    // Standard fullscreen events
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);

    // iOS Safari specific events
    const handleEnterFullscreen = () => setIsFullscreen(true);
    const handleExitFullscreen = () => setIsFullscreen(false);

    if (video) {
      video.addEventListener("webkitbeginfullscreen", handleEnterFullscreen);
      video.addEventListener("webkitendfullscreen", handleExitFullscreen);
    }

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener("msfullscreenchange", handleFullscreenChange);

      if (video) {
        video.removeEventListener("webkitbeginfullscreen", handleEnterFullscreen);
        video.removeEventListener("webkitendfullscreen", handleExitFullscreen);
      }
    };
  }, [isSimpleVideo]);

  // Unified pointer/touch/mouse behavior
  useEffect(() => {
    if (isSimpleVideo) return;
    const container = containerRef.current;
    const video = videoRef.current;
    const controls = controlsRef.current;
    if (!container || !video) return;

    // Helpers
    const isDescendantOfControls = (target: EventTarget | null): boolean => {
      if (!controls || !(target instanceof Node)) return false;

      return controls.contains(target);
    };

    const isDescendantOfFeedback = (target: EventTarget | null): boolean => {
      if (!feedbackRef.current || !(target instanceof Node)) return false;
      return feedbackRef.current.contains(target);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') {
        setShowControls(true);
      }
    };

    const handlePointerLeave = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') {
        setShowControls(false);
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') {
        if (!isDescendantOfControls(e.target)) {
          e.preventDefault();
          if (video.paused) {
            video.play().catch(handleVideoPlayError);
          } else {
            video.pause();
          }
        } else {
          setShowControls(true);
        }
      } else if (e.pointerType === 'touch') {
        if (!showControls) {
          setShowControls(true);
          if (!isDescendantOfFeedback(e.target)) {
            e.preventDefault();
          }
        } else if (!isDescendantOfControls(e.target)) {
          setShowControls(false);
          e.preventDefault();
        }
      }
    };

    // Add pointer event listeners
    container.addEventListener('pointermove', handlePointerMove as EventListener);
    container.addEventListener('pointerleave', handlePointerLeave as EventListener);
    container.addEventListener('pointerdown', handlePointerDown as EventListener, { passive: false } as AddEventListenerOptions);

    return () => {
      container.removeEventListener('pointermove', handlePointerMove as EventListener);
      container.removeEventListener('pointerleave', handlePointerLeave as EventListener);
      container.removeEventListener('pointerdown', handlePointerDown as EventListener);
    };

  }, [showControls, handleVideoPlayError, isSimpleVideo, containerRef]);  


  return (
    <>
      {!isPlaying && failedToPlayMessage && (
        <div
          ref={feedbackRef}
          className=" z-10 absolute-center flex flex-col justify-center items-center gap-2 sm:gap-4 bg-popover-blur p-2 rounded-md"
        >
          {failedToPlayMessage === "loading-timeout" && (
            <div className="text-center text-xs">
              <P>Video failed to load in a reasonable amount of time.</P>
              <P>You may try again.</P>
            </div>
          )}
          <Button onClick={togglePlay} loading={isLoading}>
            Play <PlayIcon />
          </Button>
        </div>
      )}

      {isBuffering && (
        <div className="z-10 absolute-center bg-popover-blur px-3 py-1 rounded-md">
          <P>Buffering...</P>
        </div>
      )}
      <video
        ref={videoRef}
        poster={poster}
        loop={loop}
        autoPlay={autoPlay}
        muted={defaultMuted}
        playsInline
        webkit-playsinline="true"
        controls={false}
        preload={autoPlay ? "auto" : "metadata"}
        className={cn(
          "w-full object-contain transition-opacity duration-500",
          isLoading ? "opacity-0" : isBuffering ? "opacity-60" : "opacity-100",
          className
        )}
      >
        <source src={src} type={mimeType} />
      </video>

      {(controls || minimalControls) && (
        <div
          ref={controlsRef}
          className={cn(
            "absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-4 transition-opacity duration-200",
            showControls
              ? "opacity-100"
              : "opacity-0 group-hover/video:opacity-100"
          )}
        >
          {/* Progress bar */}
          {minimalControls ? null : (
            <div className="p-4">
              <Slider
                value={[currentTime]}
                max={duration}
                reversed
                step={0.1}
                onValueChange={handleSeek}
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-wrap">
              <Button
                variant="secondary"
                size="icon"
                onClick={togglePlay}
                loading={isLoading}
              >
                {isPlaying ? (
                  <PauseIcon className="size-4" />
                ) : (
                  <PlayIcon className="size-4" />
                )}
              </Button>

              <Button variant="secondary" size="icon" onClick={toggleMute}>
                {isMuted ? (
                  <VolumeXIcon className="size-4" />
                ) : (
                  <Volume2Icon className="size-4" />
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

            {minimalControls ? null : (
              <div
                className={cn("text-white text-sm", "flex items-center gap-4")}
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
            )}
          </div>
        </div>
      )}
    </>
  );
};



export default VideoViewer;
