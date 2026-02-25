import { ImageDropzone } from "@/components/media/ImageDropzone";
import { VideoDropzone } from "@/components/media/VideoDropzone";
import ButtonEditor from "@/components/timeline/ButtonEditor";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { GalleryItemFormValues } from "@/forms/upsertGalleryItem";
import useGalleryById from "@/hooks/useGalleryById";
import { ParsedBlockChainAsset } from "@/types/asset";
import { EntrySource } from "@/types/entry";
import { GalleryItemTypes } from "@/types/galleryItem";
import { getFileAspectRatio } from "@/utils/media";
import { extractVideoThumbnail } from "@/utils/videoThumbnail";
import { FC, useMemo, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import SelectBlockchainAsset from "../../SelectBlockchainAsset";

interface NewItemFormContentProps { 
  form: UseFormReturn<GalleryItemFormValues>;
  selectedItemType: GalleryItemTypes;
  blockchainAsset: ParsedBlockChainAsset | null;
  setBlockchainAsset: (asset: ParsedBlockChainAsset | null) => void;
  setAspectRatio: (aspectRatio: number | null) => void; 
  galleryId: string;
  uploadedImageFile?: File;
  setUploadedImageFile: (file: File | undefined) => void;
  previewImage: { url: string; aspectRatio: number } | null;
  setPreviewImage: (image: { url: string; aspectRatio: number } | null) => void;
  uploadedVideoFile?: File;
  setUploadedVideoFile: (file: File | undefined) => void;
  previewVideoUrl?: string | null;
  setPreviewVideoUrl: (url: string | null) => void;
  uploadedThumbnailFile?: File;
  setUploadedThumbnailFile: (file: File | undefined) => void;
}

const NewItemFormContent: FC<NewItemFormContentProps> = ({
  form,
  selectedItemType,
  blockchainAsset,
  setBlockchainAsset,
  setAspectRatio,
  galleryId,
  uploadedImageFile,
  setUploadedImageFile,
  previewImage,
  setPreviewImage,
  uploadedVideoFile,
  setUploadedVideoFile,
  previewVideoUrl,
  setPreviewVideoUrl,
  uploadedThumbnailFile,
  setUploadedThumbnailFile,
}) => {
  const { gallery } = useGalleryById(galleryId);
  const source = gallery?.source || EntrySource.Creator;
  const [mediaType, setMediaType] = useState<"image" | "video">("image");

  const usedAssetAddresses = useMemo(() => {
    const items =
      gallery?.items
        ?.filter((item) => item.itemType === GalleryItemTypes.BlockchainAsset)
        .map((item) => item.tokenAddress) || [];
    return new Set(items);
  }, [gallery?.items]);
  
  const isBlockchainEntry = selectedItemType === GalleryItemTypes.BlockchainAsset;
  const isUserAssetEntry = selectedItemType === GalleryItemTypes.UserAsset;

  const handleImageFileSelect = async (file: File) => {
    // Clean up previous object URL if it exists
    if (previewImage?.url.startsWith("blob:")) {
      URL.revokeObjectURL(previewImage.url);
    }
    
    setUploadedImageFile(file);
    
    // Create object URL for preview
    const objectUrl = URL.createObjectURL(file);
    
    // Calculate aspect ratio
    try {
      const aspectRatio = await getFileAspectRatio(file);
      setPreviewImage({ url: objectUrl, aspectRatio });
    } catch (error) {
      console.error("Failed to calculate image aspect ratio:", error);
      setUploadedImageFile(undefined);
      URL.revokeObjectURL(objectUrl);
    }
  };

  const handleVideoFileSelect = async (file: File) => {
    // Clean up previous object URLs if they exist
    if (previewVideoUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewVideoUrl);
    }
    if (previewImage?.url.startsWith("blob:")) {
      URL.revokeObjectURL(previewImage.url);
    }
    
    setUploadedVideoFile(file);
    
    // Create object URL for video preview
    const videoUrl = URL.createObjectURL(file);
    setPreviewVideoUrl(videoUrl);
    
    // Try to extract thumbnail from first frame
    try {
      const thumbnailFile = await extractVideoThumbnail(file);
      if (thumbnailFile) {
        setUploadedThumbnailFile(thumbnailFile);
        
        // Create object URL for thumbnail preview
        const thumbnailUrl = URL.createObjectURL(thumbnailFile);
        
        // Calculate aspect ratio from thumbnail
        const aspectRatio = await getFileAspectRatio(thumbnailFile);
        setPreviewImage({ url: thumbnailUrl, aspectRatio });
      } else {
        // If extraction fails, clear thumbnail but keep video
        setUploadedThumbnailFile(undefined);
        setPreviewImage(null);
      }
    } catch (error) {
      console.warn("Failed to extract video thumbnail:", error);
      setUploadedThumbnailFile(undefined);
      setPreviewImage(null);
    }
  };

  const handleThumbnailFileSelect = async (file: File) => {
    // Clean up previous object URL if it exists
    if (previewImage?.url.startsWith("blob:")) {
      URL.revokeObjectURL(previewImage.url);
    }
    
    setUploadedThumbnailFile(file);
    
    // Create object URL for preview
    const objectUrl = URL.createObjectURL(file);
    
    // Calculate aspect ratio
    try {
      const aspectRatio = await getFileAspectRatio(file);
      setPreviewImage({ url: objectUrl, aspectRatio });
    } catch (error) {
      console.error("Failed to calculate thumbnail aspect ratio:", error);
      setUploadedThumbnailFile(undefined);
      URL.revokeObjectURL(objectUrl);
    }
  };

  const handleClearPreview = () => {
    if (previewImage?.url.startsWith("blob:")) {
      URL.revokeObjectURL(previewImage.url);
    }
    if (previewVideoUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewVideoUrl);
    }
    setUploadedImageFile(undefined);
    setUploadedVideoFile(undefined);
    setUploadedThumbnailFile(undefined);
    setPreviewImage(null);
    setPreviewVideoUrl(null);
  };

  const handleClearVideoPreview = () => {
    if (previewVideoUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewVideoUrl);
    }
    setUploadedVideoFile(undefined);
    setPreviewVideoUrl(null);
    // Don't clear thumbnail - user might want to keep it
  };

  const hideDetailInputs = (isBlockchainEntry && !blockchainAsset) || 
    (isUserAssetEntry && mediaType === "image" && !uploadedImageFile) ||
    (isUserAssetEntry && mediaType === "video" && (!uploadedVideoFile || !uploadedThumbnailFile));

  return (
    <div className="flex flex-col gap-y-6">
      {isBlockchainEntry ? (
        <SelectBlockchainAsset
          usedAssetAddresses={usedAssetAddresses}
          blockchainAsset={blockchainAsset}
          setBlockchainAsset={setBlockchainAsset}
          source={source}
          setAspectRatio={setAspectRatio}
        />
      ) : null}

      {isUserAssetEntry ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <FormLabel>Media Type</FormLabel>
            <Tabs value={mediaType} onValueChange={(value) => {
              setMediaType(value as "image" | "video");
              // Clear all previews when switching
              handleClearPreview();
            }}>
              <TabsList>
                <TabsTrigger value="image">Image</TabsTrigger>
                <TabsTrigger value="video">Video</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {mediaType === "image" ? (
            <div className="space-y-2">
              <FormLabel>Image</FormLabel>
              <ImageDropzone
                onFileSelect={handleImageFileSelect}
                previewUrl={previewImage?.url || null}
                onClearPreview={handleClearPreview}
                className="min-h-[200px]"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <FormLabel>Video</FormLabel>
                <VideoDropzone
                  onFileSelect={handleVideoFileSelect}
                  previewUrl={previewVideoUrl || null}
                  onClearPreview={handleClearVideoPreview}
                  className="min-h-[200px]"
                />
              </div>
              <div className="space-y-2">
                <FormLabel>Thumbnail (required)</FormLabel>
                <ImageDropzone
                  onFileSelect={handleThumbnailFileSelect}
                  previewUrl={previewImage?.url || null}
                  onClearPreview={() => {
                    if (previewImage?.url.startsWith("blob:")) {
                      URL.revokeObjectURL(previewImage.url);
                    }
                    setUploadedThumbnailFile(undefined);
                    setPreviewImage(null);
                  }}
                  className="min-h-[200px]"
                />
              </div>
            </div>
          )}
        </div>
      ) : null}

      {hideDetailInputs ? null : (
        <>
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {selectedItemType === GalleryItemTypes.Text ? "Content" : "Description"}
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={
                      selectedItemType === GalleryItemTypes.Text
                        ? "Enter text content"
                        : "Enter description"
                    }
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <ButtonEditor form={form} tokenAddress={blockchainAsset?.tokenAddress} />
        </>
      )}
    </div>
  );
}

export default NewItemFormContent;