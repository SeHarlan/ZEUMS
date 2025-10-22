"use client";
import SideDrawer from "@/components/general/SideDrawer";
import { BlockchainAssetEntryIcon, TextEntryIcon } from "@/components/icons/EntryTypes";
import { P } from "@/components/typography/Typography";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { GALLERY_ITEM_ROUTE } from "@/constants/serverRoutes";
import { useUser } from "@/context/UserProvider";
import { galleryItemFormSchema, GalleryItemFormValues } from "@/forms/upsertGalleryItem";
import useGalleryById from "@/hooks/useGalleryById";

import { BLOCKCHAIN_GALLERY_ITEM_COPY, GALLERY_ITEM_TYPE_COPY, TEXT_GALLERY_ITEM_COPY } from "@/textCopy/entryTypes";
import { ParsedBlockChainAsset } from "@/types/asset";
import { EntrySource } from "@/types/entry";
import { GalleryItem, GalleryItemCreation, GalleryItemTypes } from "@/types/galleryItem";
import { getLastGalleryRowIndex } from "@/utils/gallery";
import { addHttpsPrefix } from "@/utils/general";
import { handleClientError } from "@/utils/handleError";
import { cn } from "@/utils/ui-utils";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { ArrowLeftIcon, ImagePlusIcon } from "lucide-react";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import AddBlockchainGalleryItems from "../AddBlockchainGalleryItems";
import NewItemFormContent from "./NewItemFormContent";

const formId = "new-gallery-item-form";

interface NewItemFormProps {
  galleryId: string;
  buttonClassName?: string;
  buttonVariant?: "default" | "outline" | "ghost" | "link";
  buttonText?: string;
}

const NewItemForm: FC<NewItemFormProps> = ({
  galleryId,
  buttonClassName,
  buttonVariant = "default",
  buttonText = "Add Content",
}) => {
  const { gallery, mutateGallery } = useGalleryById(galleryId);
  const { user, revalidateUser } = useUser();
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [blockchainAsset, setBlockchainAsset] = useState<ParsedBlockChainAsset | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [contentChosen, setContentChosen] = useState<boolean>(false);

  const prevBlockchainAssetRef = useRef<ParsedBlockChainAsset | null>(null);
  const prevGalleryItemTypeRef = useRef<GalleryItemTypes>(
    GalleryItemTypes.BlockchainAsset
  );

  const source = gallery?.source || EntrySource.Creator;

  const defaultValues: GalleryItemFormValues = useMemo(() => ({
    itemType: GalleryItemTypes.BlockchainAsset,
    title: "",
    description: "",
    buttons: [],
  }), []);

  const form = useForm<GalleryItemFormValues>({
    resolver: zodResolver(galleryItemFormSchema),
    defaultValues,
  });

  const { reset, watch } = form;
  const { title, description, itemType: selectedGalleryItemType } = watch();

  const disableSubmit =
    (selectedGalleryItemType === GalleryItemTypes.BlockchainAsset &&
      !blockchainAsset) ||
    !user;
  
  const blockchainAddText = source === EntrySource.Creator ? "created" : "collected";

  
  const getHeaderText = () => {
    if (contentChosen) {
      return GALLERY_ITEM_TYPE_COPY[selectedGalleryItemType];
    }

    return {
      title: "Add Content",
      description: `Add content to ${gallery?.title || "your gallery"}.`,
    };
  };
  const headerText = getHeaderText();

  const handleChooseContent = (itemType: GalleryItemTypes) => {
    setContentChosen(true);
    form.setValue("itemType", itemType);
  };

  useEffect(() => {
    const isBlockchainAsset =
      selectedGalleryItemType === GalleryItemTypes.BlockchainAsset;
    const isDifferent =
      blockchainAsset?.tokenAddress !==
      prevBlockchainAssetRef.current?.tokenAddress;

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
  }, [
    blockchainAsset,
    reset,
    title,
    description,
    defaultValues,
    selectedGalleryItemType,
  ]);

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
    //don't rest state till drawer has fully closed
    setTimeout(() => {
      setBlockchainAsset(null);
      setAspectRatio(null);
      reset(defaultValues);
      prevBlockchainAssetRef.current = null;
      prevGalleryItemTypeRef.current = GalleryItemTypes.BlockchainAsset;
      setContentChosen(false);
    }, 333);
  };
  const handleOpenChange = (newOpen: boolean) => {
    if (!submitting) {
      setFormOpen(newOpen);
      if (!newOpen) {
        fullFormReset();
      }
    }
  };
  const onSubmit = (data: GalleryItemFormValues) => {
    if (!user || !gallery) return;

    setSubmitting(true);

    // Add https:// prefix to button URLs if they don't have a protocol
    if (data.buttons) {
      data.buttons = data.buttons.map((button) => ({
        ...button,
        url: addHttpsPrefix(button.url),
      }));
    }

    const lastRowIndex = getLastGalleryRowIndex(gallery.items);

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
      .post<{ createdGalleryItem: GalleryItem }>(
        GALLERY_ITEM_ROUTE,
        itemCreationData
      )
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

        // Revalidate user if the first two rows changed
        // Will effect user gallery cards and gallery entries
        if (createdGalleryItem.position[0] < 2) {
          revalidateUser();
        }

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
        <Button
          variant={buttonVariant}
          className={cn("w-full", buttonClassName)}
        >
          <P>{buttonText}</P>
          <ImagePlusIcon className="hidden sm:block" />
        </Button>
      }
      open={formOpen}
      onOpenChange={handleOpenChange}
      title={headerText.title}
      description={headerText.description}
      actionButton={
        contentChosen && (
          <Button
            form={formId}
            type="submit"
            className="w-full"
            loading={submitting}
            disabled={disableSubmit}
          >
            <P>Save {GALLERY_ITEM_TYPE_COPY[selectedGalleryItemType].title}</P>
          </Button>
        )
      }
    >
      {contentChosen ? (
        <div className="space-y-6">
          <Button
            onClick={() => setContentChosen(false)}
            className="w-full mb-2"
            size="lg"
            variant="ghost"
          >
            <ArrowLeftIcon />
            <P>Back to choose content</P>
          </Button>
          <Separator />
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} id={formId}>
              <NewItemFormContent
                form={form}
                selectedItemType={selectedGalleryItemType}
                blockchainAsset={blockchainAsset}
                setBlockchainAsset={setBlockchainAsset}
                setAspectRatio={setAspectRatio}
                galleryId={galleryId}
              />
            </form>
          </Form>
        </div>
      ) : (
        <div className="space-y-6 py-4">
          <AddBlockchainGalleryItems
            galleryId={galleryId}
            onSave={() => setFormOpen(false)}
          >
            <Button
              variant="default"
              className="rounded-lg w-full h-26 has-[>svg]:px-6 text-md flex justify-start items-center gap-6 whitespace-normal"
            >
              <BlockchainAssetEntryIcon className="size-12 text-neutral-400" />
              <div className="text-left min-w-0">
                <P className="font-bold text-lg ">
                  {BLOCKCHAIN_GALLERY_ITEM_COPY.title}
                </P>
                <P className="text-sm text-neutral-400">
                  {BLOCKCHAIN_GALLERY_ITEM_COPY.description}s you{" "}
                  {blockchainAddText}
                </P>
              </div>
            </Button>
          </AddBlockchainGalleryItems>

          <Button
            onClick={() => handleChooseContent(GalleryItemTypes.Text)}
            variant="outline"
            className="rounded-lg w-full h-26 has-[>svg]:px-6 text-md flex justify-start items-center gap-6 whitespace-normal"
          >
            <TextEntryIcon className="size-12 text-muted-foreground" />

            <div className="text-left min-w-0">
              <P className="font-bold text-lg">
                {TEXT_GALLERY_ITEM_COPY.title}
              </P>
              <P className="text-sm text-muted-foreground">
                {TEXT_GALLERY_ITEM_COPY.description}
              </P>
            </div>
          </Button>
          {/* <Button
            variant="default"
            className="rounded-lg w-full h-26 has-[>svg]:px-6 text-md flex justify-start items-center gap-6 whitespace-normal"
            onClick={() => handleChooseContent(GalleryItemTypes.Gallery)}
          >
            <GalleryGalleryItemIcon className="size-12 text-neutral-400" />
            <div className="text-left min-w-0">
              <P className="font-bold text-lg ">{GALLERY_GALLERY_ITEM_COPY.title}</P>
              <P className="text-sm text-neutral-400">
                {GALLERY_GALLERY_ITEM_COPY.description} you {blockchainAddText}
              </P>
            </div>
          </Button> */}
        </div>
      )}
    </SideDrawer>
  );
};

export default NewItemForm;