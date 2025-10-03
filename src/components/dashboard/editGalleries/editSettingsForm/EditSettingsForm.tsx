"use client";
import { FC, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
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
import { usePathname, useRouter } from "next/navigation";
import { EDIT_GALLERY } from "@/constants/clientRoutes";
import { Separator } from "@/components/ui/separator";
import { ImagesIcon } from "lucide-react";
import EditSettingsContent from "./EditSettingsFormContent";

const formId = "edit-gallery-form";

interface EditGallerySettingsProps { 
  editingGallery: UserVirtualGalleryType | null;
  onClose: () => void;
}

const EditGallerySettings: FC<EditGallerySettingsProps> = ({ editingGallery, onClose }) => {
  const [submitting, setSubmitting] = useState(false);
  const galleryId = editingGallery?._id?.toString() || "";
  const { mutateGallery, isLoading } = useGalleryById(galleryId);
  const { revalidateUser } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const notOnGalleryItemsPage = !pathname.includes(EDIT_GALLERY(galleryId));

  const defaultValues: Partial<UpsertGalleryFormValues> = useMemo(() => ({
    title: editingGallery?.title || "",
    description: editingGallery?.description || "",
    hideItemTitles: editingGallery?.hideItemTitles || false,
    hideItemDescriptions: editingGallery?.hideItemDescriptions || false,
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
      hideItemTitles: data.hideItemTitles,
      hideItemDescriptions: data.hideItemDescriptions,
    };

    axios
      .patch<{ updatedGallery: GalleryType }>(GALLERY_ROUTE, updatedGalleryData)
      .then((response) => {
        const { updatedGallery } = response.data;

        toast.success("Gallery updated!");

        // Update the main gallery data using SWR mutation
        mutateGallery(updatedGallery, false)

        //update user if the gallery title or description changed for gallery Cards
        if (updatedGallery.title !== editingGallery.title || updatedGallery.description !== editingGallery.description) {
          revalidateUser();
        }

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
      {notOnGalleryItemsPage && (
        <>
          <Button onClick={goToGalleryItems} className="w-full">
            Manage Gallery Items
            <ImagesIcon />
          </Button>
          <Separator className="my-6" />
        </>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} id={formId}>
          <EditSettingsContent form={form} />
        </form>
      </Form>
    </SideDrawer>
  );
};

export default EditGallerySettings;