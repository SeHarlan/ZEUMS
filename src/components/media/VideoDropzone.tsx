"use client";

import { cn } from "@/utils/ui-utils";
import { UploadIcon, VideoIcon, XIcon } from "lucide-react";
import React, { useCallback, useRef, useState } from "react";

export interface VideoDropzoneProps {
  /**
   * Callback fired when a valid video file is selected
   */
  onFileSelect: (file: File) => void;
  /**
   * Maximum file size in bytes (default: 100MB)
   */
  maxFileSize?: number;
  /**
   * Accepted video MIME types (default: MP4 and WebM)
   */
  acceptedVideoTypes?: readonly string[];
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Whether the component is disabled
   */
  disabled?: boolean;
  /**
   * Optional preview video URL to display
   */
  previewUrl?: string | null;
  /**
   * Callback fired when preview should be cleared
   */
  onClearPreview?: () => void;
  /**
   * Custom error message handler
   */
  onError?: (error: string) => void;
}

const DEFAULT_MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

const DEFAULT_ACCEPTED_TYPES = [
  "video/mp4",
  "video/webm",
] as const;

export function VideoDropzone({
  onFileSelect,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  acceptedVideoTypes = DEFAULT_ACCEPTED_TYPES,
  className,
  disabled = false,
  previewUrl,
  onClearPreview,
  onError,
}: VideoDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const validateFile = useCallback(
    (file: File): boolean => {
      // Check file type
      if (!acceptedVideoTypes.includes(file.type as typeof acceptedVideoTypes[number])) {
        const errorMsg = `Invalid file type. Only MP4 and WebM formats are supported.`;
        setError(errorMsg);
        onError?.(errorMsg);
        return false;
      }

      // Check file size
      if (file.size > maxFileSize) {
        const maxSizeMB = (maxFileSize / (1024 * 1024)).toFixed(0);
        const errorMsg = `File size exceeds maximum of ${maxSizeMB}MB`;
        setError(errorMsg);
        onError?.(errorMsg);
        return false;
      }

      setError(null);
      return true;
    },
    [acceptedVideoTypes, maxFileSize, onError]
  );

  const handleFile = useCallback(
    (file: File) => {
      if (validateFile(file)) {
        onFileSelect(file);
      }
    },
    [validateFile, onFileSelect]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
      // Reset input to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [handleFile]
  );

  const handleClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [disabled, handleFile]
  );

  const handleClearPreview = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onClearPreview?.();
    },
    [onClearPreview]
  );

  const acceptString = acceptedVideoTypes.join(",");

  return (
    <div className={cn("relative w-full", className)}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload video"
        aria-disabled={disabled}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled) {
            e.preventDefault();
            handleClick();
          }
        }}
        className={cn(
          "relative w-full h-full min-h-[200px] border-2 border-dashed rounded-sm",
          "flex flex-col items-center justify-center gap-3",
          "transition-colors cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-input bg-background hover:border-primary/50 hover:bg-accent/50",
          disabled && "opacity-50 cursor-not-allowed pointer-events-none",
          error && "border-destructive"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptString}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
          aria-label="File input"
        />

        {previewUrl ? (
          <>
            <div className="relative w-full h-full min-h-[200px] rounded-sm overflow-hidden">
              <video
                ref={videoRef}
                src={previewUrl}
                className="w-full h-full object-contain"
                controls={false}
                muted
                playsInline
              />
              {onClearPreview && (
                <button
                  type="button"
                  onClick={handleClearPreview}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm border border-input hover:bg-background transition-colors"
                  aria-label="Clear preview"
                >
                  <XIcon className="size-4" />
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <div
              className={cn(
                "flex items-center justify-center size-12 rounded-full",
                isDragging ? "bg-primary/10" : "bg-accent"
              )}
            >
              {isDragging ? (
                <UploadIcon className="size-6 text-primary" />
              ) : (
                <VideoIcon className="size-6 text-muted-foreground" />
              )}
            </div>
            <div className="text-center px-4">
              <p className="text-sm font-medium text-foreground">
                {isDragging ? "Drop video here" : "Click to upload or drag and drop"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                MP4, WebM (max {(maxFileSize / (1024 * 1024)).toFixed(0)}MB)
              </p>
            </div>
          </>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
