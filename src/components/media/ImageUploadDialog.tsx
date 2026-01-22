"use client";

import { ImageDropzone } from "@/components/media/ImageDropzone";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FolderPlusIcon } from "lucide-react";
import { FC, useEffect, useMemo, useState } from "react";

interface ImageUploadDialogProps {
  title: string;
  description?: string;
  onSelect: (file: File) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  acceptedImageTypes?: readonly string[];
  maxFileSize?: number;
}

const ImageUploadDialog: FC<ImageUploadDialogProps> = ({
  title,
  description,
  onSelect,
  open,
  onOpenChange,
  acceptedImageTypes,
  maxFileSize
}) => {
  const [selectedFile, setSelectedFile] = useState<File | undefined>();

  // Create object URL for preview (computed, not state)
  const previewUrl = useMemo(() => {
    if (!selectedFile) return null;
    return URL.createObjectURL(selectedFile);
  }, [selectedFile]);

  // Clean up object URL when it changes or component unmounts
  useEffect(() => {
    if (!previewUrl) return;
    
    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleClearPreview = () => {
    setSelectedFile(undefined);
  };

  const handleSelect = () => {
    if (selectedFile) {
      onSelect(selectedFile);
      setSelectedFile(undefined);
      onOpenChange(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Clear selection when dialog closes
      setSelectedFile(undefined);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="rounded-full"
        >
          <FolderPlusIcon className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="py-4">
          <ImageDropzone
            onFileSelect={handleFileSelect}
            previewUrl={previewUrl}
            onClearPreview={handleClearPreview}
            acceptedImageTypes={acceptedImageTypes}
            maxFileSize={maxFileSize}
          />
        </div>
        <DialogFooter>
          <Button
            type="button"
            onClick={handleSelect}
            disabled={!selectedFile}
          >
            Select
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageUploadDialog;
