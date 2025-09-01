"use client";
import { cn } from "@/utils/ui-utils";
import React, { useEffect, useRef, useState } from "react";
import "@google/model-viewer";

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

  useEffect(() => {
    const modelViewer = modelViewerRef.current;
    // Add event listeners after the component mounts
    if (modelViewer) {
      const handleLoadEvent = () => {
        console.log('Model loaded successfully');
        setIsLoading(false);
      };
      
      const handleErrorEvent = (event: Event) => {
        console.error('Model viewer error:', event);
        setIsLoading(false);
        onError?.(event);
      };

      modelViewer.addEventListener('load', handleLoadEvent);
      modelViewer.addEventListener('error', handleErrorEvent);
      
      return () => {
        modelViewer.removeEventListener('load', handleLoadEvent);
        modelViewer.removeEventListener('error', handleErrorEvent);
      };
    }
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
          "w-full h-full min-h-50 transition-opacity duration-500 object-cover",
          isLoading ? "opacity-33" : "opacity-100",
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
