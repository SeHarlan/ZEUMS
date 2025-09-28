"use client";
import { FC, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GalleryType } from "@/types/gallery";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "sonner";
import { handleClientError } from "@/utils/handleError";
import { GALLERY_ROUTE } from "@/constants/serverRoutes";
import SideDrawer from "@/components/general/SideDrawer";
import { P } from "@/components/typography/Typography";
import useGalleryById from "@/hooks/useGalleryById";
import { upsertGalleryFormSchema, UpsertGalleryFormValues } from "@/forms/upsertGallery";
import { useUser } from "@/context/UserProvider";
import { convertToUserVirtualGallery, getGalleryKey } from "@/utils/gallery";

const formId = "edit-gallery-form";

interface EditGallerySettingsProps { 
  isOpen: boolean;
  galleryId: string | null;
  onClose: () => void;
}

const EditGallerySettings: FC<EditGallerySettingsProps> = ({ isOpen, galleryId, onClose }) => {
  const [submitting, setSubmitting] = useState(false);
  const { gallery, mutateGallery, isLoading } = useGalleryById(galleryId);
  const { setUser } = useUser();

  const defaultValues: Partial<UpsertGalleryFormValues> = useMemo(() => ({
    title: gallery?.title || "",
    description: gallery?.description || "",
  }), [gallery])

  const form = useForm<UpsertGalleryFormValues>({
    resolver: zodResolver(upsertGalleryFormSchema),
    defaultValues,
  });

  const { reset } = form;

  useEffect(() => {
    //isOpen means there is a gallery to edit
    if (isOpen) { 
      reset(defaultValues)
    }else {
      reset(); // Clear form when drawer closes
    }
  }, [reset, defaultValues, isOpen]);

  const onSubmit = (data: UpsertGalleryFormValues) => {
    if (!gallery) return;

    setSubmitting(true);

    const updatedGalleryData = {
      _id: gallery._id,
      title: data.title,
      description: data.description,
    };

    axios
      .patch<{ updatedGallery: GalleryType }>(GALLERY_ROUTE, updatedGalleryData)
      .then((response) => {
        const { updatedGallery } = response.data;

        toast.success("Gallery updated!");

        // Update the gallery data using SWR mutation
        mutateGallery(updatedGallery, false)

        const galleryKey = getGalleryKey(gallery.source)
        //update the user context with the new gallery
        setUser((prevUser) => {
          if (!prevUser) return prevUser;

          const prevGalleries = prevUser[galleryKey] || [];

          //update and keep in the same order
          const updatedGalleries = prevGalleries.map((gallery) => {
            if (gallery._id.toString() === updatedGallery._id.toString()) {
              // convert to user virtual gallery so its consistent with what the user state galleries usually have (only one item with media)
              return convertToUserVirtualGallery(updatedGallery);
            }
            return gallery;
          });
          return {
            ...prevUser,
            [galleryKey]: updatedGalleries,
          };
        });

        onClose();
      })
      .catch((error) => {
        toast.error("Failed to update gallery.");
        handleClientError({
          error,
          location: "EditGallerySettings_onSubmit",
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
      title="Gallery Settings"
      description="Edit gallery title and description."
      actionButton={
        <Button
          onClick={() => form.handleSubmit(onSubmit)()} // Direct form submission
          className="w-full"
          loading={submitting || isLoading}
          disabled={!gallery}
        >
          <P>Update Gallery</P>
        </Button>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} id={formId}>
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
                    <Textarea
                      placeholder="Enter gallery description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
    </SideDrawer>
  );
};

export default EditGallerySettings;