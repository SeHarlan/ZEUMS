"use client";
import { cn } from "@/utils/ui-utils";
import React, { ReactEventHandler, useState } from "react";

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

  return (
    <div
      className={cn(
        "relative w-full h-full pointer-events-auto",
        isLoading && "animate-skeleton-shimmer",
        containerClassName
      )}
    >
      <iframe
        className={cn(
          "w-full h-full transition-opacity duration-500 touch-none",
          isLoading ? "opacity-33" : "opacity-100",
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

