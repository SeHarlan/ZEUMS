import { ImageDropzone } from "@/components/media/ImageDropzone";
import ButtonEditor from "@/components/timeline/ButtonEditor";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GalleryItemFormValues } from "@/forms/upsertGalleryItem";
import useGalleryById from "@/hooks/useGalleryById";
import { ParsedBlockChainAsset } from "@/types/asset";
import { EntrySource } from "@/types/entry";
import { GalleryItemTypes } from "@/types/galleryItem";
import { getFileAspectRatio } from "@/utils/media";
import { FC, useMemo } from "react";
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
}) => {
  const { gallery } = useGalleryById(galleryId);
  const source = gallery?.source || EntrySource.Creator;

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

  const handleClearPreview = () => {
    if (previewImage?.url.startsWith("blob:")) {
      URL.revokeObjectURL(previewImage.url);
    }
    setUploadedImageFile(undefined);
    setPreviewImage(null);
  };

  const hideDetailInputs = (isBlockchainEntry && !blockchainAsset) || (isUserAssetEntry && !uploadedImageFile);

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
        <div className="space-y-2">
          <FormLabel>Image</FormLabel>
          <ImageDropzone
            onFileSelect={handleImageFileSelect}
            previewUrl={previewImage?.url || null}
            onClearPreview={handleClearPreview}
            className="min-h-[200px]"
          />
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
          <ButtonEditor form={form} />
        </>
      )}
    </div>
  );
}

export default NewItemFormContent;