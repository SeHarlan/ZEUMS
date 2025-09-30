import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { FC } from "react";
import { UpsertGalleryFormValues } from "@/forms/upsertGallery";
import { Switch } from "@/components/ui/switch";

interface EditSettingsContentProps { 
  form: UseFormReturn<UpsertGalleryFormValues>;
}

const EditSettingsContent: FC<EditSettingsContentProps> = ({form}) => { 
  return (
    <div className="flex flex-col gap-y-6">
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input placeholder="Enter gallery title" {...field} />
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
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea placeholder="Enter gallery description" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="hideItemTitles"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Hide Item Titles</FormLabel>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="hideItemDescriptions"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Hide Item Descriptions</FormLabel>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
export default EditSettingsContent