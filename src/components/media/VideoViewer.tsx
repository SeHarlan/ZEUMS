"use client";

import { 
  FC,
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
  webkitEnterFullscreen?: () => Promise<void>; // iOS Safari
  webkitEnterFullScreen?: () => Promise<void>; // Older iOS Safari (capitalization varies)
}

interface FullscreenDocument extends Document {
  webkitExitFullscreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
  webkitFullscreenElement?: Element;
  msFullscreenElement?: Element;
}

interface VideoViewerProps {
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
  muted = true,
  loop = false,
  onLoadedMetadata,
  onError,
}) => {
  const defaultMuted = autoPlay ? true : muted;

  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(defaultMuted);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted state on client-side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Add mobile-specific video attributes after mount
  useEffect(() => {
    if (!isMounted) return;
    
    const video = videoRef.current;
    if (!video) return;

    // Set mobile-specific attributes that React doesn't recognize
    video.setAttribute('webkit-playsinline', 'true');
    video.setAttribute('x5-playsinline', 'true');
    video.setAttribute('x5-video-player-type', 'h5');
    video.setAttribute('x5-video-player-fullscreen', 'true');
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    
    const video = videoRef.current;
    if (!video) return;
    let bufferingTimeout: NodeJS.Timeout;

    // Handle autoplay on mobile Safari
    if (autoPlay && defaultMuted) {
      video.play().catch((error) => {
        if (error.name !== "AbortError") {
          console.warn("Autoplay failed:", error);
          // Don't set error state for autoplay failures
          // User can manually click play
        }
      });
    }

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
      // Check if this is an autoplay error
      const video = e.target as HTMLVideoElement;
      
      // Common autoplay error patterns
      const isAutoplayError = 
        // Safari: NotAllowedError or AbortError during autoplay
        (video?.error?.message?.includes('NotAllowedError') && autoPlay) ||
        (e instanceof Error && e.name === 'AbortError' && autoPlay) ||
        // Chrome/Firefox autoplay policy errors
        (video?.error?.message?.includes('play') && video?.error?.message?.includes('user')) ||
        // General autoplay policy errors
        (video?.error?.message?.includes('autoplay') || video?.error?.message?.includes('play'));

      // Safari mobile specific format errors (often happen with arweave.net videos)
      const isSafariFormatError = 
        video?.error?.code === 4 && // MEDIA_ERR_SRC_NOT_SUPPORTED
        /iPhone|iPad|iPod/.test(navigator?.userAgent || '') && 
        /Safari/.test(navigator?.userAgent || '');
      
      if (isAutoplayError) {
        console.log('Ignoring autoplay error:', video?.error?.message);
        // Just set the video to paused state without showing error
        setIsPlaying(false);
        setIsLoading(false);
        return; // Exit early, don't propagate autoplay errors
      }
      
      // For Safari format errors, we still log but don't treat as fatal
      if (isSafariFormatError) {
        console.log('Safari format error - continuing playback attempt:', video?.error?.message);
        setIsPlaying(false);
        // Don't return - let the player try to recover
      }
      
      // For other errors, continue with normal error handling
      setIsLoading(false);
      setIsPlaying(false);
      
      // Log detailed error information for non-autoplay errors
      console.error("Video loading error:", {
        error: e,
        readyState: video?.readyState,
        networkState: video?.networkState,
        error_code: video?.error?.code,
        error_message: video?.error?.message,
        src: video?.src,
        currentSrc: video?.currentSrc,
        userAgent: navigator?.userAgent
      });
      
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
  }, [isMounted, autoPlay, defaultMuted, onLoadedMetadata, onError]);

  const togglePlay = async () => {

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

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const toggleFullscreen = useCallback(() => {
    if (!videoRef.current) return;

    const video = videoRef.current as FullscreenVideoElement;
    const doc = document as FullscreenDocument;
    
    // Check if we're in fullscreen mode
    const isInFullscreen = !!(
      document.fullscreenElement || 
      doc.webkitFullscreenElement || 
      doc.msFullscreenElement
    );

    if (!isInFullscreen) {
      // Enter fullscreen - try iOS specific method first
      if (video.webkitEnterFullscreen) {
        // iOS Safari specific method
        video.webkitEnterFullscreen().catch(err => console.warn("iOS fullscreen failed:", err));
      } else if (video.webkitEnterFullScreen) {
        // Older iOS Safari (different capitalization)
        video.webkitEnterFullScreen().catch(err => console.warn("iOS fullscreen failed:", err));
      } else if (video.requestFullscreen) {
        // Standard method
        video.requestFullscreen().catch(err => console.warn("Fullscreen failed:", err));
      } else if (video.webkitRequestFullscreen) {
        // Webkit browsers
        video.webkitRequestFullscreen();
      } else if (video.msRequestFullscreen) {
        // IE/Edge
        video.msRequestFullscreen();
      } else {
        console.warn("Fullscreen API not supported");
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => console.warn("Exit fullscreen failed:", err));
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
      }
    }
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    if (!isMounted) return;

    const doc = document as FullscreenDocument;
    const video = videoRef.current;

    const handleFullscreenChange = () => {
      const isInFullscreen = !!(
        document.fullscreenElement || 
        doc.webkitFullscreenElement || 
        doc.msFullscreenElement
      );
      
      // For iOS Safari which doesn't use standard fullscreen events
      const isVideoInFullscreen = video && 
        (video as { webkitDisplayingFullscreen?: boolean }).webkitDisplayingFullscreen === true;
      
      setIsFullscreen(isInFullscreen || !!isVideoInFullscreen);
    };

    // Standard fullscreen events
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);
    
    // iOS Safari specific events
    const handleEnterFullscreen = () => setIsFullscreen(true);
    const handleExitFullscreen = () => setIsFullscreen(false);
    
    if (video) {
      video.addEventListener('webkitbeginfullscreen', handleEnterFullscreen);
      video.addEventListener('webkitendfullscreen', handleExitFullscreen);
    }

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
      
      if (video) {
        video.removeEventListener('webkitbeginfullscreen', handleEnterFullscreen);
        video.removeEventListener('webkitendfullscreen', handleExitFullscreen);
      }
    };
  }, [isMounted]);

  // Unified pointer/touch/mouse behavior
  useEffect(() => {
    if (!isMounted) return;
    const container = containerRef.current;
    const video = videoRef.current;
    const controls = controlsRef.current;
    if (!container || !video) return;

    // Helpers
    const isDescendantOfControls = (target: EventTarget | null): boolean => {
      if (!controls || !(target instanceof Node)) return false;
      return controls.contains(target);
    };

    // Unified pointer event handling
    const handlePointerMove = (e: PointerEvent) => {
      // Only show controls on mouse movement, not touch
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
        // Real mouse event
        if (!isDescendantOfControls(e.target)) {
          // Toggle play/pause on mouse clicks outside controls
          e.preventDefault();
          if (video.paused) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        } else {
          // Inside controls: ensure panel is visible
          setShowControls(true);
        }
      } else if (e.pointerType === 'touch') {
        // Touch event
        if (!showControls) {
          // Panel closed: open it
          setShowControls(true);
          e.preventDefault();
        } else {
          // Panel open: if touch outside controls, close it
          if (!isDescendantOfControls(e.target)) {
            setShowControls(false);
            e.preventDefault();
          }
          // If inside controls, let it pass through to buttons/sliders
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
  }, [isMounted, showControls]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative group/video w-full h-full flex justify-center items-center",
        isLoading && "animate-skeleton-shimmer",
        containerClassName
      )}
    >

      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        muted={defaultMuted}
        loop={loop}
        playsInline
        preload="metadata"  
        className={cn(
          "w-full",
          "object-contain transition-opacity duration-500",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
      />


      {(controls || minimalControls) && (
        <div
          ref={controlsRef}
          className={cn(
            "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-200",
            showControls
              ? "opacity-100"
              : "opacity-0 group-hover/video:opacity-100"
          )}
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
