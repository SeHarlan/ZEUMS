"use client";
import { cn } from "@/utils/ui-utils";
import React, { useEffect, useRef, useState } from "react";
import type { ModelViewerElement } from "@google/model-viewer";

interface ModelViewerProps {
  className?: string;
  containerClassName?: string;
  src: string;
  onError?: (event: Event) => void;
}

const ModelViewer: React.FC<ModelViewerProps> = ({
  className,
  containerClassName,
  src,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const modelViewerRef = useRef<ModelViewerElement>(null);

  // Register the web component on the client
  useEffect(() => {    
    let canceled = false;
    (async () => {
      await import("@google/model-viewer");
      if (canceled) return;

      const mv = modelViewerRef.current;
      if (!mv) return;

      const handleLoad = () => setIsLoading(false);
      const handleError = (e: Event) => {
        setIsLoading(false);
        onError?.(e);
      };

      mv.addEventListener("load", handleLoad);
      mv.addEventListener("error", handleError);

      return () => {
        mv.removeEventListener("load", handleLoad);
        mv.removeEventListener("error", handleError);
      };
    })();

    return () => {
      canceled = true;
    };
  }, [onError]);

  return (
    <div
      className={cn(
        "relative w-full h-full",
        isLoading && "animate-skeleton-shimmer",
        containerClassName
      )}
    >
      <model-viewer
        className={cn(
          "w-full h-full min-h-50 transition-opacity duration-500 object-cover p-4",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
        ref={modelViewerRef}
        src={src}
        camera-controls="true"
        auto-rotate="true"
        autoplay="true"
        rotation-per-second="10deg"
        shadow-intensity="1"
        interaction-prompt="none"
        environment-image="neutral"
        ar="false"
        ar-modes="webxr scene-viewer quick-look"
        loading="eager"
        reveal="auto"
        reveal-when-loaded="false"
      />
    </div>
  );
};

export default ModelViewer;
