"use client";
import EditGalleryItemFormContent from "@/components/dashboard/editGalleryItems/editItemForm/EditItemFormContent";
import SideDrawer from "@/components/general/SideDrawer";
import { P } from "@/components/typography/Typography";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { GALLERY_ITEM_ROUTE } from "@/constants/serverRoutes";
import { useUser } from "@/context/UserProvider";
import { galleryItemFormSchema, GalleryItemFormValues } from "@/forms/upsertGalleryItem";
import useGalleryById from "@/hooks/useGalleryById";
import { GalleryItem, GalleryItemTypes } from "@/types/galleryItem";
import { addHttpsPrefix } from "@/utils/general";
import { handleClientError } from "@/utils/handleError";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { FC, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const formId = "edit-gallery-item-form";

interface EditGalleryItemFormProps { 
  isOpen: boolean;
  editingItem: GalleryItem | null;
  onClose: () => void;
}

const EditGalleryItemForm: FC<EditGalleryItemFormProps> = ({ isOpen, editingItem, onClose }) => {
  const [submitting, setSubmitting] = useState(false);

  const selectedItemType = editingItem?.itemType || GalleryItemTypes.BlockchainAsset;
  const galleryId = editingItem?.parentGalleryId?.toString() || "";
  const { mutateGallery } = useGalleryById(galleryId);
  const { revalidateUser } = useUser();

  const defaultValues: GalleryItemFormValues = useMemo(() => ({
    itemType: selectedItemType,
    title: editingItem?.title || "",
    description: editingItem?.description || "",
    buttons: editingItem?.buttons || [],
  }), [editingItem, selectedItemType])

  const form = useForm<GalleryItemFormValues>({
    resolver: zodResolver(galleryItemFormSchema),
    defaultValues,
  });

  const { reset } = form;

  useEffect(() => {
    //isOpen means there is an item to edit
    if (isOpen) { 
      reset(defaultValues)
    } else {
      reset(); // Clear form when drawer closes
    }
  }, [reset, defaultValues, isOpen]);

  const onSubmit = (data: GalleryItemFormValues) => {
    if (!editingItem) return;

    setSubmitting(true);

    // Add https:// prefix to button URLs if they don't have a protocol
    if (data.buttons) {
      data.buttons = data.buttons.map(button => ({
        ...button,
        url: addHttpsPrefix(button.url)
      }));
    }

    // TODO: improve typing with proper GalleryItem type
    const updatedItemData: Partial<GalleryItem> = {
      _id: editingItem._id,
      ...data,
    };

    axios
      .patch<{ updatedGalleryItem: GalleryItem }>(GALLERY_ITEM_ROUTE, updatedItemData)
      .then((response) => {
        const { updatedGalleryItem } = response.data;

        toast.success("Gallery item updated!");

        mutateGallery((prev) => {
          if (!prev) return prev;
          const updatedItems = prev.items?.map((item) => {
            if (item._id === updatedGalleryItem._id) {
              return updatedGalleryItem;
            }
            return item;
          });
          return {
            ...prev,
            items: updatedItems,
          };
        }, false);


        // Revalidate user if the first two rows changed
        // Will effect user gallery cards and gallery entries
        if (updatedGalleryItem.position[0] < 2) {
          revalidateUser();
        }

        onClose();
      })
      .catch((error) => {
        toast.error("Failed to update gallery item.");
        handleClientError({
          error,
          location: "EditGalleryItemForm_onSubmit",
        });
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const handleOpenChange = (open: boolean) => { 
    if (!open) onClose()
  }

  return (
    <SideDrawer
      triggerButton={null}
      open={isOpen}
      onOpenChange={handleOpenChange}
      title="Update Gallery Item"
      description="Edit an existing gallery item."
      actionButton={
        <Button
          onClick={() => form.handleSubmit(onSubmit)()} // Direct form submission
          className="w-full"
          loading={submitting}
        >
          <P>Update Item</P>
        </Button>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} id={formId}>
          <EditGalleryItemFormContent
            form={form}
            selectedItemType={selectedItemType}
            handleOpenChange={handleOpenChange}
          />
        </form>
      </Form>
    </SideDrawer>
  );
};

export default EditGalleryItemForm;
