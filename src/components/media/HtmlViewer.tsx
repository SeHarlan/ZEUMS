"use client";
import { cn } from "@/utils/ui-utils";
import React, { ReactEventHandler, useEffect, useRef, useState } from "react";

interface HtmlViewerProps {
  src: string;
  containerClassName?: string;
  className?: string;
  onError?: ReactEventHandler<HTMLIFrameElement>;
}

const HtmlViewer: React.FC<HtmlViewerProps> = ({
  src,
  onError,
  containerClassName,
  className,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    //using preventDefault to stop scrolling in iframe
    const iframe = iframeRef.current;
    if (!iframe) return;
    iframe.addEventListener("touchstart", (e) => e.preventDefault(), {
      passive: false,
    });
    iframe.addEventListener("touchmove", (e) => e.preventDefault(), {
      passive: false,
    });
    iframe.addEventListener("touchend", (e) => e.preventDefault(), {
      passive: false,
    });
    return () => {
      iframe.removeEventListener("touchstart", (e) => e.preventDefault());
      iframe.removeEventListener("touchmove", (e) => e.preventDefault());
      iframe.removeEventListener("touchend", (e) => e.preventDefault());
    };
  },[])
  return (
    <div
      className={cn(
        "relative w-full h-full pointer-events-auto",
        isLoading && "animate-skeleton-shimmer",
        containerClassName
      )}
    >
      <iframe
        ref={iframeRef}
        className={cn(
          "w-full h-full transition-opacity duration-500",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
        src={src}
        onError={onError}
        sandbox="allow-scripts allow-same-origin"
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
};

export default HtmlViewer;

