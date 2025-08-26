"use client";
import { cn } from "@/utils/ui-utils";
import { ModelViewerElement } from "@google/model-viewer";
import React, { ReactEventHandler, useState } from "react";

interface ModelViewerProps {
  className?: string;
  containerClassName?: string;
  src: string;
  poster?: string;
  onError?: ReactEventHandler<ModelViewerElement>;
}

const ModelViewer: React.FC<ModelViewerProps> = ({
  className,
  containerClassName,
  src,
  poster,
  onError,
}) => {
    const [isLoading, setIsLoading] = useState(true);
    
  return (
    <div
      className={cn(
        "relative w-full h-full",
        isLoading && "animate-skeleton-shimmer",
        containerClassName
      )}
    >
      {React.createElement("model-viewer", {
        className: cn(
          "w-full h-full",
          isLoading ? "opacity-33" : "opacity-100",
          className
        ),
        src,
        poster,
        "camera-controls": true,
        "auto-rotate": true,
        autoplay: true,
        "rotation-per-second": "10deg",
        "shadow-intensity": "1",
        "interaction-prompt": "none",
        "environment-image": "null",
        onError,
        onLoad: () => setIsLoading(false),
      })}
    </div>
  );
};

export default ModelViewer;
