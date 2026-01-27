import { ImageDropzone } from "@/components/media/ImageDropzone";
import { VideoDropzone } from "@/components/media/VideoDropzone";
import ButtonEditor from "@/components/timeline/ButtonEditor";
import { P } from "@/components/typography/Typography";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/context/UserProvider";
import { EntryFormValues } from "@/forms/upsertEntry";
import { ParsedBlockChainAsset } from "@/types/asset";
import { EntrySource, EntryTypes } from "@/types/entry";
import { UserVirtualGalleryType } from "@/types/gallery";
import { getFirstBlockchainItem } from "@/utils/gallery";
import { getFileAspectRatio } from "@/utils/media";
import { getTimelineKey } from "@/utils/timeline";
import { extractVideoThumbnail } from "@/utils/videoThumbnail";
import { cn } from "@/utils/ui-utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { FC, useMemo, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import SelectBlockchainAsset from "../../SelectBlockchainAsset";
import SelectGalleryEntry from "../../SelectGalleryEntry";

interface NewEntryFormContentProps {
  form: UseFormReturn<EntryFormValues>;
  selectedEntryType: EntryTypes;
  blockchainAsset: ParsedBlockChainAsset | null;
  setBlockchainAsset: (asset: ParsedBlockChainAsset | null) => void;
  setAspectRatio: (aspectRatio: number | null) => void;
  source: EntrySource;
  gallery: UserVirtualGalleryType | null;
  setGallery: (gallery: UserVirtualGalleryType | null) => void;
  handleGetMintDates: (tokenAddress?: string) => void;
  fetchingMintDate: boolean;
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

const NewEntryFormContent: FC<NewEntryFormContentProps> = ({
  handleGetMintDates,
  form,
  selectedEntryType,
  blockchainAsset,
  setBlockchainAsset,
  setAspectRatio,
  gallery,
  setGallery,
  fetchingMintDate,
  source,
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
  const {user} = useUser();
  const isBlockchainEntry = selectedEntryType === EntryTypes.BlockchainAsset;
  const isGalleryEntry = selectedEntryType === EntryTypes.Gallery;
  const isUserAssetEntry = selectedEntryType === EntryTypes.UserAsset;
  const [mediaType, setMediaType] = useState<"image" | "video">("image");

  const hasFetchableDate = isBlockchainEntry || isGalleryEntry 

  const hideDetailInputs = (isBlockchainEntry && !blockchainAsset) || 
    (isGalleryEntry && !gallery) || 
    (isUserAssetEntry && mediaType === "image" && !uploadedImageFile) ||
    (isUserAssetEntry && mediaType === "video" && (!uploadedVideoFile || !uploadedThumbnailFile));

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
  
  const timelineKey = getTimelineKey(source);

  const usedAssetAddresses = useMemo(() => {
    const currentTimeline = user?.[timelineKey] || [];
    const items =
      currentTimeline
        ?.filter((item) => item.entryType === EntryTypes.BlockchainAsset)
        .map((item) => item.tokenAddress) || [];
    return new Set(items);
  }, [user, timelineKey]);

  const handleGetMintDate = () => { 
    if(isBlockchainEntry) {
      handleGetMintDates(blockchainAsset?.tokenAddress);
    } else if(isGalleryEntry) {
      const firstItem = getFirstBlockchainItem(gallery?.items);
      handleGetMintDates(firstItem?.tokenAddress);
    }
  }

  const getDateText = () => {
    if(isBlockchainEntry) {
      return "Get mint date"
    } else if(isGalleryEntry) {
      return "Get first item's mint date";
    }
  }

  return (
    <div className="flex flex-col gap-y-6">
      {hideDetailInputs ? null : (
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <Popover>
                <FormControl>
                  <div
                    className={cn(
                      "w-full ",
                      hasFetchableDate &&
                        "grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2"
                    )}
                  >
                    {fetchingMintDate ? (
                      <Button
                        disabled
                        variant={"outline"}
                        className="text-left justify-start"
                      >
                        <P>Retrieving mint date...</P>
                      </Button>
                    ) : (
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant={"outline"}
                          className={cn(
                            " pl-3 text-left font-normal w-full",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={fetchingMintDate}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                    )}
                    {hasFetchableDate && (
                      <Button
                        variant="ghost"
                        type="button"
                        onClick={handleGetMintDate}
                        loading={fetchingMintDate}
                      >
                        {getDateText()}
                      </Button>
                    )}
                  </div>
                </FormControl>

                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    captionLayout="dropdown"
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                This date determines the order of entries
              </FormDescription>
            </FormItem>
          )}
        />
      )}

      {isBlockchainEntry ? (
        <SelectBlockchainAsset
          usedAssetAddresses={usedAssetAddresses}
          blockchainAsset={blockchainAsset}
          setBlockchainAsset={setBlockchainAsset}
          source={source}
          setAspectRatio={setAspectRatio}
        />
      ) : null}

      {isGalleryEntry ? (
        <SelectGalleryEntry
          entryGallery={gallery}
          setEntryGallery={setGallery}
          source={source}
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
                  {selectedEntryType === EntryTypes.Text
                    ? "Content"
                    : "Description"}
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={
                      selectedEntryType === EntryTypes.Text
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

export default NewEntryFormContent;