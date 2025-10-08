import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, EditIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/utils/ui-utils";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { EntryFormValues } from "@/forms/upsertEntry";
import { EntryTypes } from "@/types/entry";
import { FC } from "react";
import { Button, LinkButton } from "@/components/ui/button";
import {  P } from "@/components/typography/Typography";
import { ENTRY_TYPE_COPY } from "@/textCopy/entryTypes";
import { EntryTypeIcons } from "@/components/icons/EntryTypes";
import ButtonEditor from "@/components/timeline/ButtonEditor";
import { EDIT_GALLERY } from "@/constants/clientRoutes";

interface EditEntryFormContentProps { 
  form: UseFormReturn<EntryFormValues>;
  selectedEntryType: EntryTypes;
  galleryId?: string;
  handleOpenChange: (open: boolean) => void;
  handleGetMintDates: () => void;
  fetchingMintDate: boolean;
}

const EditEntryFormContent: FC<EditEntryFormContentProps> = ({
  form,
  selectedEntryType,
  galleryId,
  handleOpenChange,
  handleGetMintDates,
  fetchingMintDate,
}) => { 
  const { title, description } = ENTRY_TYPE_COPY[selectedEntryType]
  const Icon = EntryTypeIcons[selectedEntryType];

  const isGalleryEntry = galleryId && selectedEntryType === EntryTypes.Gallery;
  const isBlockchainEntry = selectedEntryType === EntryTypes.BlockchainAsset;
  
  const hasFetchableDate = isBlockchainEntry || isGalleryEntry; 

  const getDateText = () => {
    if(isBlockchainEntry) {
      return "Get mint date"
    } else if(isGalleryEntry) {
      return "Get first item's mint date";
    }
  }

  return (
    <div className="flex flex-col gap-y-6">
      <div className="mt-3 space-y-1">
        <div className="bg-muted rounded-md p-3 flex items-center justify-between">
          <div className="flex gap-2 items-center">
            <Icon className="min-w-6 min-h-6 text-muted-foreground" />
            <P>{title}</P>
          </div>
          {isGalleryEntry && (
            <LinkButton
              href={EDIT_GALLERY(galleryId)}
              className="h-6"
              onClick={() => handleOpenChange(false)}
            >
              Edit Gallery Items
              <EditIcon />
            </LinkButton>
          )}
        </div>
        <P className="text-muted-foreground">{description}</P>
      </div>

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
                      onClick={() => handleGetMintDates()}
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
    </div>
  );
}

export default EditEntryFormContent;