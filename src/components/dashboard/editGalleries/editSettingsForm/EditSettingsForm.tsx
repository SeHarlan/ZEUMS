"use client";
import SideDrawer from "@/components/general/SideDrawer";
import { P } from "@/components/typography/Typography";
import { Button, LinkButton } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { EDIT_GALLERY, USER_GALLERY } from "@/constants/clientRoutes";
import { DUPLICATE_KEY_ERROR } from "@/constants/errors";
import { GALLERY_ROUTE } from "@/constants/serverRoutes";
import { useUser } from "@/context/UserProvider";
import { upsertGalleryFormSchema, UpsertGalleryFormValues } from "@/forms/upsertGallery";
import useGalleryById from "@/hooks/useGalleryById";
import { GalleryType, UserVirtualGalleryType } from "@/types/gallery";
import { ImageType } from "@/types/media";
import { handleClientError } from "@/utils/handleError";
import { cn } from "@/utils/ui-utils";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { EyeIcon, ImagesIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { FC, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import EditSettingsContent from "./EditSettingsFormContent";

const formId = "edit-gallery-form";

interface EditGallerySettingsProps { 
  editingGallery: UserVirtualGalleryType | null;
  onClose: () => void;
}

const EditGallerySettings: FC<EditGallerySettingsProps> = ({ editingGallery, onClose }) => {
  const [submitting, setSubmitting] = useState(false);
  const [bannerImage, setBannerImage] = useState<ImageType | null | undefined>(editingGallery?.bannerImage);

  const galleryId = editingGallery?._id?.toString() || "";
  const { mutateGallery, isLoading } = useGalleryById(galleryId);
  const { revalidateUser, user } = useUser();
  const pathname = usePathname();

  const notOnGalleryItemsPage = !pathname.includes(EDIT_GALLERY(galleryId));

  const viewGalleryPath = USER_GALLERY(user?.username, editingGallery?.title);

  const defaultValues: Partial<UpsertGalleryFormValues> = useMemo(() => ({
    title: editingGallery?.title || "",
    description: editingGallery?.description || "",
    hideItemTitles: editingGallery?.hideItemTitles ?? false,
    hideItemDescriptions: editingGallery?.hideItemDescriptions ?? true,
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
    } else {
      reset(); // Clear form when drawer closes
    }
  }, [reset, defaultValues, isOpen]);

  useEffect(() => {
    if (editingGallery?.bannerImage && bannerImage === undefined) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBannerImage(editingGallery.bannerImage);
    }
  }, [editingGallery?.bannerImage, bannerImage]);


  const onSubmit = (data: UpsertGalleryFormValues) => {
    if (!editingGallery) return;

    setSubmitting(true);

    const updatedGalleryData: Partial<GalleryType> = {
      _id: editingGallery._id,
      title: data.title,
      description: data.description,
      hideItemTitles: data.hideItemTitles,
      hideItemDescriptions: data.hideItemDescriptions,
      bannerImage,
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
        const duplicateKeyError = error?.response?.data?.error === DUPLICATE_KEY_ERROR
        const description = duplicateKeyError
          ? "You already have a gallery with this title."
          : undefined;
        
        toast.error("Failed to update gallery.", {
          description,
        });

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
          disabled={!editingGallery}
        >
          <P>Update Gallery</P>
        </Button>
      }
    >
      <div className="grid sm:grid-cols-2 gap-4 pt-4">
        {notOnGalleryItemsPage && (
          <>
            <LinkButton
              href={EDIT_GALLERY(galleryId)}
              variant="outline"
              className="w-full"
            >
              Manage Gallery Items
              <ImagesIcon />
            </LinkButton>
            <LinkButton
              href={viewGalleryPath}
              className={cn("w-full", !notOnGalleryItemsPage && "col-span-2")}
            >
              View Gallery
              <EyeIcon />
            </LinkButton>
            <Separator className="col-span-2 mt-2 mb-6" />
          </>
        )}
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} id={formId}>
          <EditSettingsContent 
            form={form} 
            bannerImage={bannerImage} 
            setBannerImage={setBannerImage}
          />
        </form>
      </Form>
    </SideDrawer>
  );
};

export default EditGallerySettings;