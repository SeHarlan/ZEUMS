import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { FC } from "react";
import { GALLERY_ITEM_TYPE_COPY } from "@/textCopy/entryTypes";
import { GalleryItemTypeIcons } from "@/components/icons/EntryTypes";
import ButtonEditor from "@/components/timeline/ButtonEditor";
import { GalleryItemFormValues } from "@/forms/upsertGalleryItem";
import { GalleryItemTypes } from "@/types/galleryItem";
import { P } from "@/components/typography/Typography";

interface EditGalleryItemFormContentProps { 
  form: UseFormReturn<GalleryItemFormValues>;
  selectedItemType: GalleryItemTypes;
}

const EditGalleryItemFormContent: FC<EditGalleryItemFormContentProps> = ({
  form,
  selectedItemType,
}) => {
  const { title, description } = GALLERY_ITEM_TYPE_COPY[selectedItemType];
  const Icon = GalleryItemTypeIcons[selectedItemType];

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
              {selectedItemType === GalleryItemTypes.Text
                ? "Content"
                : "Description"}
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
    </div>
  );
};

export default EditGalleryItemFormContent;
