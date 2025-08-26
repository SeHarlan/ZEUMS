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
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/utils/ui-utils";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { EntryFormValues } from "@/forms/upsertEntry";
import { EntryTypes } from "@/types/entry";
import { FC } from "react";
import { Button } from "@/components/ui/button";
import {  P } from "@/components/typography/Typography";
import { ENTRY_TYPE_COPY } from "@/textCopy/entryTypes";
import { EntryTypeIcons } from "@/components/icons/EntryTypes";

interface EditEntryFormContentProps { 
  form: UseFormReturn<EntryFormValues>;
  selectedEntryType: EntryTypes;
}

const EditEntryFormContent: FC<EditEntryFormContentProps> = ({
  form,
  selectedEntryType,
}) => { 
  const { title, description } = ENTRY_TYPE_COPY[selectedEntryType]
  const Icon = EntryTypeIcons[selectedEntryType];

  return (
    <div className="flex flex-col gap-y-6">
      <div>
        <div className="flex gap-2 items-center">
          <Icon className="min-w-6 min-h-6" />
          <P>{title}</P>
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
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      " pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(field.value, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
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
    </div>
  );
}

export default EditEntryFormContent;