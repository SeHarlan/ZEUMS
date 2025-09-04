"use client";
import { cn } from "@/utils/ui-utils";
import React, { ReactEventHandler, useEffect, useRef, useState } from "react";

interface HtmlViewerProps {
  src: string;
  containerClassName?: string;
  className?: string;
  onError?: ReactEventHandler<HTMLIFrameElement> | ((e: unknown) => void);
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
    const iframe = iframeRef.current;

    const preventScrollIfFrame = (event: TouchEvent) => {
      const isCanvas = iframeRef && (event.target === iframeRef.current || iframeRef.current?.contains(event.target as Node));
      if (isCanvas) event.preventDefault();
    };
    
    if (!iframe) return;
    iframe.addEventListener("touchstart", preventScrollIfFrame, {passive: false });
    iframe.addEventListener("touchmove", preventScrollIfFrame, {passive: false });
    iframe.addEventListener("touchend", preventScrollIfFrame, {passive: false });
    return () => {
      iframe.removeEventListener("touchstart", preventScrollIfFrame);
      iframe.removeEventListener("touchmove", preventScrollIfFrame);
      iframe.removeEventListener("touchend", preventScrollIfFrame);
    };
  }, [])
  
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

