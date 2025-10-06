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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { FC } from "react";
import { EntrySource } from "@/types/entry";
import SelectBlockchainAsset from "../../SelectBlockchainAsset";
import { ParsedBlockChainAsset } from "@/types/asset";
import { BLOCKCHAIN_ENTRY_COPY, GALLERY_ITEM_TYPE_COPY, TEXT_ENTRY_COPY } from "@/textCopy/entryTypes";
import { BlockchainAssetEntryIcon, TextEntryIcon } from "@/components/icons/EntryTypes";
import ButtonEditor from "@/components/timeline/ButtonEditor";
import { GalleryItemFormValues } from "@/forms/upsertGalleryItem";
import { GalleryItemTypes } from "@/types/galleryItem";

interface NewItemFormContentProps { 
  form: UseFormReturn<GalleryItemFormValues>;
  selectedItemType: GalleryItemTypes;
  blockchainAsset: ParsedBlockChainAsset | null;
  setBlockchainAsset: (asset: ParsedBlockChainAsset | null) => void;
  setAspectRatio: (aspectRatio: number | null) => void; 
  source: EntrySource;
}

const NewItemFormContent: FC<NewItemFormContentProps> = ({
  form,
  selectedItemType,
  blockchainAsset,
  setBlockchainAsset,
  setAspectRatio,
  source,
}) => {
  //TODO disabled double select - get gallery items based on source and select tokens (use atom selector)
  // const disabledAssetAddresses =
  
  const isBlockchainEntry = selectedItemType === GalleryItemTypes.BlockchainAsset;

  return (
    <div className="flex flex-col gap-y-6">
      <FormField
        control={form.control}
        name="itemType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Item Type</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="w-full text-md min-h-12">
                  <SelectValue placeholder="Item type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem
                  value={GalleryItemTypes.BlockchainAsset}
                  className="h-10 text-md"
                >
                  <BlockchainAssetEntryIcon className="min-h-6 min-w-6" />
                  {BLOCKCHAIN_ENTRY_COPY.title}
                </SelectItem>
                <SelectItem
                  value={GalleryItemTypes.Text}
                  className="h-10 text-md"
                >
                  <TextEntryIcon className="min-h-6 min-w-6" />
                  {TEXT_ENTRY_COPY.title}
                </SelectItem>
                {/* <SelectItem value={EntryTypes.UserAsset}>
                  <UserAssetEntryIcon className="min-h-6 min-w-6"/>
                  {USER_ASSET_ENTRY_COPY.title}
                </SelectItem>
                <SelectItem value={EntryTypes.Gallery}>
                  <GalleryEntryIcon className="min-h-6 min-w-6"/>
                  {GALLERY_ENTRY_COPY.title}
                </SelectItem> */}
              </SelectContent>
            </Select>
            <FormDescription>
              {GALLERY_ITEM_TYPE_COPY[selectedItemType].description}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <Separator />

      {isBlockchainEntry ? (
        <SelectBlockchainAsset
          // disabledAssetAddresses={disabledAssetAddresses}
          blockchainAsset={blockchainAsset}
          setBlockchainAsset={setBlockchainAsset}
          source={source}
          setAspectRatio={setAspectRatio}
        />
      ) : null}

      {isBlockchainEntry && !blockchainAsset
        ? null
        : (
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