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
import { GalleryType, UserVirtualGalleryType } from "@/types/gallery";
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
import { useRouter } from "next/navigation";
import { EDIT_GALLERY } from "@/constants/clientRoutes";
import { Separator } from "@/components/ui/separator";
import { ImagesIcon } from "lucide-react";

const formId = "edit-gallery-form";

interface EditGallerySettingsProps { 
  editingGallery: UserVirtualGalleryType | null;
  onClose: () => void;
}

const EditGallerySettings: FC<EditGallerySettingsProps> = ({ editingGallery, onClose }) => {
  const [submitting, setSubmitting] = useState(false);
  const galleryId = editingGallery?._id?.toString() || "";
  const { mutateGallery, isLoading } = useGalleryById(galleryId);
  const { setUser } = useUser();
  const router = useRouter();

  const defaultValues: Partial<UpsertGalleryFormValues> = useMemo(() => ({
    title: editingGallery?.title || "",
    description: editingGallery?.description || "",
  }), [editingGallery])

  const form = useForm<UpsertGalleryFormValues>({
    resolver: zodResolver(upsertGalleryFormSchema),
    defaultValues,
  });

  const { reset } = form;

  const isOpen = Boolean(editingGallery);

  useEffect(() => {
    //isOpen means there is a gallery to edit
    if (isOpen) { 
      reset(defaultValues)
    }else {
      reset(); // Clear form when drawer closes
    }
  }, [reset, defaultValues, isOpen]);

  const onSubmit = (data: UpsertGalleryFormValues) => {
    if (!editingGallery) return;

    setSubmitting(true);

    const updatedGalleryData = {
      _id: editingGallery._id,
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

        const galleryKey = getGalleryKey(editingGallery.source)
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
  
  const goToGalleryItems = () => {
    router.push(EDIT_GALLERY(galleryId));
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
          disabled={!editingGallery}
        >
          <P>Update Gallery</P>
        </Button>
      }
    >
      <Button onClick={goToGalleryItems} className="w-full">
        Manage Gallery Items
        <ImagesIcon />
      </Button>
      <Separator className="my-6" />
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