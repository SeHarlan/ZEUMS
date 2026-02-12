"use client";
import SideDrawer from "@/components/general/SideDrawer";
import { P } from "@/components/typography/Typography";
import { Button, LinkButton } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { EDIT_GALLERY, USER_GALLERY } from "@/constants/clientRoutes";
import { DUPLICATE_KEY_ERROR } from "@/constants/errors";
import { GALLERY_ROUTE } from "@/constants/serverRoutes";
import { UploadCategory } from "@/constants/uploadCategories";
import { useUser } from "@/context/UserProvider";
import { upsertGalleryFormSchema, UpsertGalleryFormValues } from "@/forms/upsertGallery";
import useGalleryById from "@/hooks/useGalleryById";
import { GalleryType, UserVirtualGalleryType } from "@/types/gallery";
import { CdnIdType, ImageType, MediaCategory, MediaOrigin } from "@/types/media";
import {
  clientImageUpload,
  getFileExtension,
  makeUserImageBlobKey,
} from "@/utils/clientImageUpload";
import { handleClientError } from "@/utils/handleError";
import { getFileAspectRatio } from "@/utils/media";
import { cn } from "@/utils/ui-utils";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { EyeIcon, ImagesIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import EditSettingsContent from "./EditSettingsFormContent";

const EDIT_GALLERY_KEY_CLOSED = "closed";

const formId = "edit-gallery-form";

interface EditGallerySettingsProps { 
  editingGallery: UserVirtualGalleryType | null;
  onClose: () => void;
}

const EditGallerySettings: FC<EditGallerySettingsProps> = (props) => {
  const galleryKey = props.editingGallery?._id?.toString() ?? EDIT_GALLERY_KEY_CLOSED;
  return <EditGallerySettingsInner key={galleryKey} {...props} />;
};

const EditGallerySettingsInner: FC<EditGallerySettingsProps> = ({ editingGallery, onClose }) => {
  const [submitting, setSubmitting] = useState(false);
  const [bannerImage, setBannerImage] = useState<ImageType | null | undefined>(editingGallery?.bannerImage);
  const [backgroundImage, setBackgroundImage] = useState<ImageType | null | undefined>(
    editingGallery?.backgroundImage ?? null
  );
  const [uploadedBannerFile, setUploadedBannerFile] = useState<File | undefined>();
  const [uploadedBackgroundFile, setUploadedBackgroundFile] = useState<File | undefined>();
  const originalBannerImageRef = useRef<ImageType | null | undefined>(editingGallery?.bannerImage);
  const originalBackgroundImageRef = useRef<ImageType | null | undefined>(editingGallery?.backgroundImage);

  const galleryId = editingGallery?._id?.toString() || "";
  const { mutateGallery, isLoading } = useGalleryById(galleryId);
  const { revalidateUser, user } = useUser();
  const pathname = usePathname();

  const notOnGalleryItemsPage = !pathname.includes(EDIT_GALLERY(galleryId));

  const viewGalleryPath = USER_GALLERY(user?.username, editingGallery?.title);

  const defaultValues: Partial<UpsertGalleryFormValues> = useMemo(
    () => ({
      title: editingGallery?.title || "",
      description: editingGallery?.description || "",
      hideItemTitles: editingGallery?.hideItemTitles ?? false,
      hideItemDescriptions: editingGallery?.hideItemDescriptions ?? true,
      useCustomBackgroundSettings: editingGallery?.useCustomBackgroundSettings ?? false,
      galleryTheme: editingGallery?.galleryTheme ?? user?.timelineTheme ?? "light",
      backgroundTintHex: editingGallery?.backgroundTintHex ?? user?.backgroundTintHex ?? "#000000",
      backgroundTintOpacity: editingGallery?.backgroundTintOpacity ?? user?.backgroundTintOpacity ?? 0,
      backgroundBlur: editingGallery?.backgroundBlur ?? user?.backgroundBlur ?? 0,
      backgroundTileCount: editingGallery?.backgroundTileCount?.toString() ?? user?.backgroundTileCount?.toString() ?? "0",
    }),
    [editingGallery, user]
  );

  const form = useForm<UpsertGalleryFormValues>({
    resolver: zodResolver(upsertGalleryFormSchema),
    defaultValues,
  });

  const { reset } = form;

  const isOpen = Boolean(editingGallery);

  useEffect(() => {
    if (isOpen) {
      reset(defaultValues);
    } else {
      reset();
    }
  }, [reset, defaultValues, isOpen]);

  const setBannerImageAndClearUpload = (image: ImageType | null | undefined) => {
    if (bannerImage?.imageCdn?.cdnId?.startsWith("blob:")) {
      URL.revokeObjectURL(bannerImage.imageCdn.cdnId);
    }
    setUploadedBannerFile(undefined);
    setBannerImage(image);
  };

  const setBackgroundImageAndClearUpload = (image: ImageType | null) => {
    if (backgroundImage?.imageCdn?.cdnId?.startsWith("blob:")) {
      URL.revokeObjectURL(backgroundImage.imageCdn.cdnId);
    }
    setUploadedBackgroundFile(undefined);
    setBackgroundImage(image);
  };

  const handleBannerFileSelect = async (file: File) => {
    if (bannerImage?.imageCdn?.cdnId?.startsWith("blob:")) {
      URL.revokeObjectURL(bannerImage.imageCdn.cdnId);
    }
    setUploadedBannerFile(file);
    const objectUrl = URL.createObjectURL(file);
    try {
      const aspectRatio = await getFileAspectRatio(file);
      setBannerImage({
        origin: MediaOrigin.User,
        category: MediaCategory.Image,
        imageCdn: { type: CdnIdType.VERCEL_BLOB_USER_IMAGE, cdnId: objectUrl },
        aspectRatio,
      });
    } catch (error) {
      console.error("Failed to calculate banner image aspect ratio:", error);
      toast.error("Something went wrong", { description: "Try again or choose a different image" });
    }
  };

  const handleBackgroundFileSelect = async (file: File) => {
    if (backgroundImage?.imageCdn?.cdnId?.startsWith("blob:")) {
      URL.revokeObjectURL(backgroundImage.imageCdn.cdnId);
    }
    setUploadedBackgroundFile(file);
    const objectUrl = URL.createObjectURL(file);
    try {
      const aspectRatio = await getFileAspectRatio(file);
      setBackgroundImage({
        origin: MediaOrigin.User,
        category: MediaCategory.Image,
        imageCdn: { type: CdnIdType.VERCEL_BLOB_USER_IMAGE, cdnId: objectUrl },
        aspectRatio,
      });
    } catch (error) {
      console.error("Failed to calculate background image aspect ratio:", error);
      toast.error("Something went wrong", { description: "Try again or choose a different image" });
    }
  };

  const onSubmit = (data: UpsertGalleryFormValues) => {
    if (!editingGallery || !user?._id) return;

    setSubmitting(true);

    const userId = user._id.toString();
    const normalizeImage = (image: ImageType | null | undefined): ImageType | null => image ?? null;
    let finalBackgroundImage: ImageType | null = normalizeImage(backgroundImage);
    let finalBannerImage: ImageType | null = normalizeImage(bannerImage);
    const isNewBackgroundUpload =
      backgroundImage?.origin === MediaOrigin.User &&
      uploadedBackgroundFile &&
      backgroundImage !== originalBackgroundImageRef.current;
    const isNewBannerUpload =
      bannerImage?.origin === MediaOrigin.User &&
      uploadedBannerFile &&
      bannerImage !== originalBannerImageRef.current;

    const doSubmit = (bg: ImageType | null, banner: ImageType | null) => {
      submitGallery(data, bg, banner);
    };

    const uploadBannerThenSubmit = async (bg: ImageType | null) => {
      if (!isNewBannerUpload || !uploadedBannerFile) {
        doSubmit(bg, finalBannerImage);
        return;
      }
      const fileExtension = getFileExtension(uploadedBannerFile);
      const imageId = `banner-${galleryId}${fileExtension}`;
      const blobKey = makeUserImageBlobKey(userId, UploadCategory.GALLERY_BANNER, imageId);
      toast.info("Uploading new banner image...");
      try {
        await clientImageUpload(uploadedBannerFile, blobKey);
        const aspectRatio =
          bannerImage?.aspectRatio ?? (await getFileAspectRatio(uploadedBannerFile));
        finalBannerImage = {
          origin: MediaOrigin.User,
          category: MediaCategory.Image,
          imageCdn: { type: CdnIdType.VERCEL_BLOB_USER_IMAGE, cdnId: imageId },
          aspectRatio,
        };
        doSubmit(bg, finalBannerImage);
      } catch (err) {
        handleClientError({ error: err, location: "EditGallerySettings_bannerUpload" });
        toast.error("Failed to upload banner image.");
        setSubmitting(false);
      }
    };

    if (isNewBackgroundUpload && uploadedBackgroundFile) {
      const fileExtension = getFileExtension(uploadedBackgroundFile);
      const imageId = `${galleryId}${fileExtension}`;
      const blobKey = makeUserImageBlobKey(userId, UploadCategory.GALLERY_BACKGROUND, imageId);
      toast.info("Uploading new background image...");
      clientImageUpload(uploadedBackgroundFile, blobKey)
        .then(async () => {
          const aspectRatio =
            backgroundImage?.aspectRatio ?? (await getFileAspectRatio(uploadedBackgroundFile));
          finalBackgroundImage = {
            origin: MediaOrigin.User,
            category: MediaCategory.Image,
            imageCdn: { type: CdnIdType.VERCEL_BLOB_USER_IMAGE, cdnId: imageId },
            aspectRatio,
          };
          await uploadBannerThenSubmit(finalBackgroundImage);
        })
        .catch((err) => {
          handleClientError({ error: err, location: "EditGallerySettings_backgroundUpload" });
          toast.error("Failed to upload background image.");
          setSubmitting(false);
        });
      return;
    }

    uploadBannerThenSubmit(finalBackgroundImage);
  };

  const submitGallery = (
    data: UpsertGalleryFormValues,
    finalBackgroundImage: ImageType | null,
    finalBannerImage: ImageType | null
  ) => {
    if (!editingGallery) return;

    const tileCount = !data.backgroundTileCount
      ? 0
      : (() => {
          const parsed = parseInt(data.backgroundTileCount ?? "0", 10);
          return isNaN(parsed) ? 0 : parsed;
        })();

    const updatedGalleryData: Partial<GalleryType> = {
      _id: editingGallery._id,
      title: data.title,
      description: data.description,
      hideItemTitles: data.hideItemTitles,
      hideItemDescriptions: data.hideItemDescriptions,
      bannerImage: finalBannerImage,
      useCustomBackgroundSettings: data.useCustomBackgroundSettings,
      galleryTheme: data.galleryTheme,
      backgroundImage: finalBackgroundImage,
      backgroundTintHex: data.backgroundTintHex,
      backgroundTintOpacity: data.backgroundTintOpacity,
      backgroundBlur: data.backgroundBlur,
      backgroundTileCount: tileCount,
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
        <form id={formId}>
          <EditSettingsContent
            form={form}
            bannerImage={bannerImage}
            setBannerImage={setBannerImageAndClearUpload}
            user={user}
            onBannerFileSelect={handleBannerFileSelect}
            backgroundImage={backgroundImage ?? null}
            setBackgroundImage={setBackgroundImageAndClearUpload}
            onBackgroundFileSelect={handleBackgroundFileSelect}
          />
        </form>
      </Form>
    </SideDrawer>
  );
};

export default EditGallerySettings;