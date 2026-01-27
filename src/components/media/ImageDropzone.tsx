"use client";

import { cn } from "@/utils/ui-utils";
import { ImageIcon, UploadIcon, XIcon } from "lucide-react";
import Image from "next/image";
import React, { useCallback, useRef, useState } from "react";

export interface ImageDropzoneProps {
  /**
   * Callback fired when a valid image file is selected
   */
  onFileSelect: (file: File) => void;
  /**
   * Maximum file size in bytes (default: 10MB)
   */
  maxFileSize?: number;
  /**
   * Accepted image MIME types (default: common image types)
   */
  acceptedImageTypes?: readonly string[];
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Whether the component is disabled
   */
  disabled?: boolean;
  /**
   * Optional preview image URL to display
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

const DEFAULT_MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB



const DEFAULT_ACCEPTED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
] as const;

export function ImageDropzone({
  onFileSelect,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  acceptedImageTypes = DEFAULT_ACCEPTED_TYPES,
  className,
  disabled = false,
  previewUrl,
  onClearPreview,
  onError,
}: ImageDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File): boolean => {
      // Check file type
      if (!acceptedImageTypes.includes(file.type as typeof acceptedImageTypes[number])) {
        const errorMsg = `Invalid file type. Accepted types: ${acceptedImageTypes.join(", ")}`;
        setError(errorMsg);
        onError?.(errorMsg);
        return false;
      }

      // Check file size
      if (file.size > maxFileSize) {
        const maxSizeMB = (maxFileSize / (1024 * 1024)).toFixed(2);
        const errorMsg = `File size exceeds maximum of ${maxSizeMB}MB`;
        setError(errorMsg);
        onError?.(errorMsg);
        return false;
      }

      setError(null);
      return true;
    },
    [acceptedImageTypes, maxFileSize, onError]
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

  const acceptString = acceptedImageTypes.join(",");

  return (
    <div className={cn("relative w-full", className)}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload image"
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
              <Image
                src={previewUrl}
                alt="Preview"
                fill
                unoptimized
                className="object-contain"
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
                <ImageIcon className="size-6 text-muted-foreground" />
              )}
            </div>
            <div className="text-center px-4">
              <p className="text-sm font-medium text-foreground">
                {isDragging ? "Drop image here" : "Click to upload or drag and drop"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {acceptedImageTypes.map((type) => type.split("/")[1]).join(", ").toUpperCase()}{" "}
                (max {(maxFileSize / (1024 * 1024)).toFixed(0)}MB)
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
