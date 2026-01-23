import { ImageDropzone } from "@/components/media/ImageDropzone";
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
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/context/UserProvider";
import { EntryFormValues } from "@/forms/upsertEntry";
import { ParsedBlockChainAsset } from "@/types/asset";
import { EntrySource, EntryTypes } from "@/types/entry";
import { UserVirtualGalleryType } from "@/types/gallery";
import { getFirstBlockchainItem } from "@/utils/gallery";
import { getFileAspectRatio } from "@/utils/media";
import { getTimelineKey } from "@/utils/timeline";
import { cn } from "@/utils/ui-utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { FC, useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
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
}) => {
  const {user} = useUser();
  const isBlockchainEntry = selectedEntryType === EntryTypes.BlockchainAsset;
  const isGalleryEntry = selectedEntryType === EntryTypes.Gallery;
  const isUserAssetEntry = selectedEntryType === EntryTypes.UserAsset;

  const hasFetchableDate = isBlockchainEntry || isGalleryEntry 

  const hideDetailInputs = (isBlockchainEntry && !blockchainAsset) || (isGalleryEntry && !gallery) || (isUserAssetEntry && !uploadedImageFile);

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