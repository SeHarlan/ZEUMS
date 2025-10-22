import { GalleryItemTypeIcons } from "@/components/icons/EntryTypes";
import ButtonEditor from "@/components/timeline/ButtonEditor";
import { P } from "@/components/typography/Typography";
import { LinkButton } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EDIT_GALLERY } from "@/constants/clientRoutes";
import { GalleryItemFormValues } from "@/forms/upsertGalleryItem";
import { GALLERY_ITEM_TYPE_COPY } from "@/textCopy/entryTypes";
import { GalleryItemTypes } from "@/types/galleryItem";
import { EditIcon } from "lucide-react";
import { FC } from "react";
import { UseFormReturn } from "react-hook-form";

interface EditGalleryItemFormContentProps {
  form: UseFormReturn<GalleryItemFormValues>;
  selectedItemType: GalleryItemTypes;
  galleryId?: string;
  handleOpenChange: (open: boolean) => void;
}

const EditGalleryItemFormContent: FC<EditGalleryItemFormContentProps> = ({
  form,
  selectedItemType,
  galleryId,
  handleOpenChange,
}) => {
  const { title, description } = GALLERY_ITEM_TYPE_COPY[selectedItemType];
  const Icon = GalleryItemTypeIcons[selectedItemType];


  const isGalleryItem = galleryId && selectedItemType === GalleryItemTypes.Gallery;
  const isBlockchainItem =
    selectedItemType === GalleryItemTypes.BlockchainAsset;
  

  return (
    <div className="flex flex-col gap-y-6 py-4">
      <div className=" space-y-3">
        {isGalleryItem && (
          <LinkButton
            href={EDIT_GALLERY(galleryId)}
            className="w-full rounded-sm"
            onClick={() => handleOpenChange(false)}
            size="sm"
          >
            Edit Gallery Items
            <EditIcon />
          </LinkButton>
        )}
        <div className="bg-muted rounded-md h-fit p-5 flex items-center justify-start gap-5 ">
          <Icon className="size-12 text-muted-foreground" />
          <div className="text-left min-w-0">
            <P className="font-bold text-lg ">{title}</P>
            <P className="text-sm break-words text-muted-foreground">
              {description}
            </P>
          </div>
        </div>
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
