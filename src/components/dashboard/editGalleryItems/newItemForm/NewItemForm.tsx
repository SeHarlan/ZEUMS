"use client";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { GalleryItem, GalleryItemCreation, GalleryItemTypes } from "@/types/galleryItem";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "sonner";
import { handleClientError } from "@/utils/handleError";
import { useUser } from "@/context/UserProvider";
import { ParsedBlockChainAsset } from "@/types/asset";
import SideDrawer from "@/components/general/SideDrawer";
import { P } from "@/components/typography/Typography";
import NewItemFormContent from "./NewItemFormContent";
import { SquarePlusIcon } from "lucide-react";
import { addHttpsPrefix } from "@/utils/general";
import { galleryItemFormSchema, GalleryItemFormValues } from "@/forms/upsertGalleryItem";
import { getLastGalleryRowIndex } from "@/utils/gallery";
import { GALLERY_ITEM_ROUTE } from "@/constants/serverRoutes";
import { GalleryType } from "@/types/gallery";
import { KeyedMutator } from "swr";

const formId = "new-gallery-item-form";

interface NewItemFormProps {
  gallery: GalleryType;
  mutateGallery: KeyedMutator<GalleryType | null>;
}

const NewItemForm: FC<NewItemFormProps> = ({gallery, mutateGallery}) => {
  const { user } = useUser()
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [blockchainAsset, setBlockchainAsset] = useState<ParsedBlockChainAsset | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);

  const prevBlockchainAssetRef = useRef<ParsedBlockChainAsset | null>(null);
  const prevGalleryItemTypeRef = useRef<GalleryItemTypes>(GalleryItemTypes.BlockchainAsset);

  const source = gallery.source;

  const defaultValues: GalleryItemFormValues = useMemo(() => ({
    itemType: GalleryItemTypes.BlockchainAsset,
    title: "",
    description: "",
    buttons: [],
  }), [])

  const form = useForm<GalleryItemFormValues>({
    resolver: zodResolver(galleryItemFormSchema),
    defaultValues,
  });

  const { reset, watch } = form;
  const { title, description, itemType: selectedGalleryItemType } = watch();

  const disableSubmit =
    selectedGalleryItemType === GalleryItemTypes.BlockchainAsset && !blockchainAsset
    || !user
  
  useEffect(() => {
    const isBlockchainAsset = selectedGalleryItemType === GalleryItemTypes.BlockchainAsset;
    const isDifferent = blockchainAsset?.tokenAddress !== prevBlockchainAssetRef.current?.tokenAddress;

    if (isBlockchainAsset && isDifferent) {
      // Only run if blockchainAsset changed
      reset({
        ...defaultValues,
        itemType: GalleryItemTypes.BlockchainAsset,
        title: blockchainAsset?.title || "",
        description: blockchainAsset?.description || "",
      });
      prevBlockchainAssetRef.current = blockchainAsset;
    }
  }, [blockchainAsset, reset, title, description, defaultValues, selectedGalleryItemType]);

  useEffect(() => {
    // Only reset if selectedGalleryItemType changed
    if (selectedGalleryItemType !== prevGalleryItemTypeRef.current) {
      setBlockchainAsset(null);
      reset({
        ...defaultValues,
        itemType: selectedGalleryItemType,
      });
      prevGalleryItemTypeRef.current = selectedGalleryItemType;
    }
  }, [selectedGalleryItemType, reset, defaultValues]);

  const fullFormReset = () => {
    setBlockchainAsset(null);
    setAspectRatio(null);
    reset(defaultValues);
    prevBlockchainAssetRef.current = null;
    prevGalleryItemTypeRef.current = GalleryItemTypes.BlockchainAsset;
  }

  const onSubmit = (data: GalleryItemFormValues) => {
    if (!user) return;

    setSubmitting(true);

    // Add https:// prefix to button URLs if they don't have a protocol
    if (data.buttons) {
      data.buttons = data.buttons.map(button => ({
        ...button,
        url: addHttpsPrefix(button.url)
      }));
    }


    const lastRowIndex = getLastGalleryRowIndex(gallery);

    let itemCreationData: GalleryItemCreation = {
      ...data,
      source,
      parentGalleryId: gallery._id.toString(),
      position: [lastRowIndex + 1, 0],
    };

    if (data.itemType === GalleryItemTypes.BlockchainAsset) {
      if (!blockchainAsset || !aspectRatio) {
        toast.error("Please select a valid blockchain asset.");
        setSubmitting(false);
        return;
      }
      
      //TODO: refactor this to use the aspect Ratio provider
      const assetWithAspectRatio: ParsedBlockChainAsset = {
        ...blockchainAsset,
        media: {
          ...blockchainAsset.media,
          aspectRatio,
        },
      };

      itemCreationData = {
        ...assetWithAspectRatio,
        ...itemCreationData,
      };
    }

    axios
      .post<{ createdGalleryItem: GalleryItem }>(GALLERY_ITEM_ROUTE, itemCreationData)
      .then((response) => {
        const { createdGalleryItem } = response.data;

        toast.success("New gallery item created!");

        // Update the gallery data using SWR mutation
        mutateGallery((prev) => {   
          if (!prev) return prev;
          const prevItems = prev.items || [];
          return {
            ...prev,
            items: [...prevItems, createdGalleryItem],
          };
        }, false);

        setFormOpen(false);
        fullFormReset();
      })
      .catch((error) => {
        toast.error("Failed to create new Gallery Item.");
        handleClientError({
          error,
          location: "NewItemForm_onSubmit",
        });
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  return (
    <SideDrawer
      triggerButton={
        <Button className="w-full">
          <P>New Gallery Item</P>
          <SquarePlusIcon />
        </Button>
      }
      open={formOpen}
      onOpenChange={setFormOpen}
      title="Add New Item"
      description="Add a new item to your gallery."
      actionButton={
        <Button
          form={formId}
          type="submit"
          className="w-full"
          loading={submitting}
          disabled={disableSubmit}
        >
          <P>Save New Item</P>
        </Button>
      }
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          id={formId}
        >
          <NewItemFormContent
            form={form}
            selectedItemType={selectedGalleryItemType}
            blockchainAsset={blockchainAsset}
            setBlockchainAsset={setBlockchainAsset}
            setAspectRatio={setAspectRatio}
            source={source}
          />
        </form>
      </Form>
    </SideDrawer>
  );
};

export default NewItemForm;