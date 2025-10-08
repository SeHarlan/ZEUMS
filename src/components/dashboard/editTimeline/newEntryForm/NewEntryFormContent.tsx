import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/utils/ui-utils";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { EntryFormValues } from "@/forms/upsertEntry";
import { FC } from "react";
import { EntrySource, EntryTypes } from "@/types/entry";
import { Button } from "@/components/ui/button";
import SelectBlockchainAsset from "../../SelectBlockchainAsset";
import { ParsedBlockChainAsset } from "@/types/asset";
import { BLOCKCHAIN_ENTRY_COPY, ENTRY_TYPE_COPY, GALLERY_ENTRY_COPY, TEXT_ENTRY_COPY } from "@/textCopy/entryTypes";
import { BlockchainAssetEntryIcon, GalleryEntryIcon, TextEntryIcon } from "@/components/icons/EntryTypes";
import ButtonEditor from "@/components/timeline/ButtonEditor";
import SelectGalleryEntry from "../../SelectGalleryEntry";
import { UserVirtualGalleryType } from "@/types/gallery";
import { P } from "@/components/typography/Typography";
import { getFirstBlockchainItem } from "@/utils/gallery";

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
}

const NewEntryFormContent: FC<NewEntryFormContentProps> = ({
  handleGetMintDates,
  form,
  selectedEntryType,
  blockchainAsset,
  setBlockchainAsset,
  setAspectRatio,
  source,
  gallery,
  setGallery,
  fetchingMintDate,
}) => {
  const isBlockchainEntry = selectedEntryType === EntryTypes.BlockchainAsset;
  const isGalleryEntry = selectedEntryType === EntryTypes.Gallery;

  const hasFetchableDate = isBlockchainEntry || isGalleryEntry 

  const hideDetailInputs = (isBlockchainEntry && !blockchainAsset) || isGalleryEntry && !gallery;

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
      <FormField
        control={form.control}
        name="entryType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Entry Type</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="w-full text-md min-h-12 bg-muted">
                  <SelectValue placeholder="Entry type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem
                  value={EntryTypes.BlockchainAsset}
                  className="h-10 text-md"
                >
                  <BlockchainAssetEntryIcon className="min-h-6 min-w-6" />
                  {BLOCKCHAIN_ENTRY_COPY.title}
                </SelectItem>
                <SelectItem value={EntryTypes.Text} className="h-10 text-md">
                  <TextEntryIcon className="min-h-6 min-w-6" />
                  {TEXT_ENTRY_COPY.title}
                </SelectItem>
                {/* <SelectItem value={EntryTypes.UserAsset}>
                  <UserAssetEntryIcon className="min-h-6 min-w-6"/>
                  {USER_ASSET_ENTRY_COPY.title}
                </SelectItem> */}
                <SelectItem value={EntryTypes.Gallery}>
                  <GalleryEntryIcon className="min-h-6 min-w-6" />
                  {GALLERY_ENTRY_COPY.title}
                </SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              {ENTRY_TYPE_COPY[selectedEntryType].description}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <Separator />

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
                      <Button disabled variant={"outline"}>
                        <P>Retrieving mint date</P>
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