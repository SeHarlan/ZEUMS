"use client";
import { newGalleryItemFormOpenAtom } from "@/atoms/dashboard";
import SideDrawer from "@/components/general/SideDrawer";
import { BlockchainAssetEntryIcon, TextEntryIcon, UserAssetEntryIcon } from "@/components/icons/EntryTypes";
import { P } from "@/components/typography/Typography";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { GALLERY_ITEM_ROUTE } from "@/constants/serverRoutes";
import { UploadCategory } from "@/constants/uploadCategories";
import { useUser } from "@/context/UserProvider";
import { galleryItemFormSchema, GalleryItemFormValues } from "@/forms/upsertGalleryItem";
import useGalleryById from "@/hooks/useGalleryById";
import { BLOCKCHAIN_GALLERY_ITEM_COPY, GALLERY_ITEM_TYPE_COPY, TEXT_GALLERY_ITEM_COPY, USER_ASSET_GALLERY_ITEM_COPY } from "@/textCopy/entryTypes";
import { GALLERY_ITEM_LABEL } from "@/textCopy/mainCopy";
import { ParsedBlockChainAsset } from "@/types/asset";
import { EntrySource } from "@/types/entry";
import { GalleryItem, GalleryItemCreation, GalleryItemTypes, UserAssetGalleryItem } from "@/types/galleryItem";
import { CdnIdType, MediaCategory, MediaOrigin, UserImage, UserMedia } from "@/types/media";
import { clientImageUpload, getFileExtension, getVideoFileExtension, makeUserImageBlobKey, makeUserVideoBlobKey, sanitizeFilename } from "@/utils/clientImageUpload";
import { clientVideoUpload } from "@/utils/clientVideoUpload";
import { getLastGalleryRowIndex } from "@/utils/gallery";
import { addHttpsPrefix } from "@/utils/general";
import { handleClientError } from "@/utils/handleError";
import { getFileAspectRatio } from "@/utils/media";
import { cn } from "@/utils/ui-utils";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useAtom } from "jotai";
import { ArrowLeftIcon, ImagePlusIcon } from "lucide-react";
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
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
  onClick?: () => void;
}

const NewItemForm = forwardRef<HTMLButtonElement, NewItemFormProps>(({
  galleryId,
  buttonClassName,
  buttonVariant = "default",
  buttonText = `Add ${GALLERY_ITEM_LABEL.capFullPlural}`,
  onClick,
}, ref) => {

  const { gallery, mutateGallery } = useGalleryById(galleryId);
  const { user, revalidateUser } = useUser();
  const [formOpen, setFormOpen] = useAtom(newGalleryItemFormOpenAtom)
  const [submitting, setSubmitting] = useState(false);
  const [blockchainAsset, setBlockchainAsset] = useState<ParsedBlockChainAsset | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [contentChosen, setContentChosen] = useState<boolean>(false);
  const [uploadedImageFile, setUploadedImageFile] = useState<File | undefined>();
  const [previewImage, setPreviewImage] = useState<{ url: string; aspectRatio: number } | null>(null);
  const [uploadedVideoFile, setUploadedVideoFile] = useState<File | undefined>();
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
  const [uploadedThumbnailFile, setUploadedThumbnailFile] = useState<File | undefined>();

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
    (selectedGalleryItemType === GalleryItemTypes.UserAsset && 
      !uploadedImageFile && !uploadedVideoFile) ||
    (selectedGalleryItemType === GalleryItemTypes.UserAsset && 
      uploadedVideoFile && !uploadedThumbnailFile) ||
    !user;
  
  const blockchainAddText = source === EntrySource.Creator ? "created" : "collected";

  
  const getHeaderText = () => {
    if (contentChosen) {
      return GALLERY_ITEM_TYPE_COPY[selectedGalleryItemType];
    }

    return {
      title: `Add ${GALLERY_ITEM_LABEL.capPlural}`,
      description: `Add content to '${gallery?.title}'`,
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
      // Clean up preview image/video if switching away from UserAsset
      if (prevGalleryItemTypeRef.current === GalleryItemTypes.UserAsset) {
        if (previewImage?.url.startsWith("blob:")) {
          URL.revokeObjectURL(previewImage.url);
        }
        if (previewVideoUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(previewVideoUrl);
        }
      }
      setUploadedImageFile(undefined);
      setUploadedVideoFile(undefined);
      setUploadedThumbnailFile(undefined);
      setPreviewImage(null);
      setPreviewVideoUrl(null);
      reset({
        ...defaultValues,
        itemType: selectedGalleryItemType,
      });
      prevGalleryItemTypeRef.current = selectedGalleryItemType;
    }
  }, [selectedGalleryItemType, reset, defaultValues, previewImage, previewVideoUrl]);

  const fullFormReset = () => {
    //don't rest state till drawer has fully closed
    setTimeout(() => {
      setBlockchainAsset(null);
      setAspectRatio(null);
      // Clean up preview image/video
      if (previewImage?.url.startsWith("blob:")) {
        URL.revokeObjectURL(previewImage.url);
      }
      if (previewVideoUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewVideoUrl);
      }
      setUploadedImageFile(undefined);
      setUploadedVideoFile(undefined);
      setUploadedThumbnailFile(undefined);
      setPreviewImage(null);
      setPreviewVideoUrl(null);
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
  const onSubmit = async (data: GalleryItemFormValues) => {
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

    if (data.itemType === GalleryItemTypes.UserAsset) {
      const isVideo = !!uploadedVideoFile;
      
      if (!uploadedImageFile && !uploadedVideoFile) {
        toast.error("Please select an image or video to upload.");
        setSubmitting(false);
        return;
      }

      if (isVideo && !uploadedThumbnailFile) {
        toast.error("Please select a thumbnail image for the video.");
        setSubmitting(false);
        return;
      }

      if (!user?._id) {
        toast.error("User must be logged in.");
        setSubmitting(false);
        return;
      }

      const userId = user._id.toString();

      try {
        if (isVideo) {
          // Handle video upload
          const videoExtension = getVideoFileExtension(uploadedVideoFile!);
          const originalVideoFilename = uploadedVideoFile!.name.trim();
          
          const sanitizedVideoFilename = originalVideoFilename && originalVideoFilename.length > 0
            ? sanitizeFilename(originalVideoFilename)
            : `${crypto.randomUUID()}${videoExtension}`;
          
          const videoId = sanitizedVideoFilename && sanitizedVideoFilename.length > 0
            ? sanitizedVideoFilename
            : `${crypto.randomUUID()}${videoExtension}`;

          const videoBlobKey = makeUserVideoBlobKey(
            userId,
            UploadCategory.UPLOADED_VIDEO,
            videoId
          );

          toast.info("Uploading video...", {
            description: "This may take some time depending on file size",
            duration: 10000, // 10 seconds
          });
          await clientVideoUpload(uploadedVideoFile!, videoBlobKey);

          // Handle thumbnail upload - name it based on video filename
          const thumbnailExtension = getFileExtension(uploadedThumbnailFile!);
          
          // Extract base name from videoId (remove extension)
          const videoIdWithoutExt = videoId.substring(0, videoId.lastIndexOf(".")) || videoId;
          
          // Create thumbnail name as "thumbnail-${videoFilename}"
          const thumbnailId = `thumbnail-${videoIdWithoutExt}${thumbnailExtension}`;

          const thumbnailBlobKey = makeUserImageBlobKey(
            userId,
            UploadCategory.UPLOADED_THUMBNAIL,
            thumbnailId
          );

          toast.info("Uploading thumbnail...");
          await clientImageUpload(uploadedThumbnailFile!, thumbnailBlobKey);

          // Calculate aspect ratio from thumbnail
          const aspectRatio = previewImage?.aspectRatio || await getFileAspectRatio(uploadedThumbnailFile!);

          // Create UserMedia object for video
          const userMedia: UserMedia = {
            origin: MediaOrigin.User,
            category: MediaCategory.Video,
            imageCdn: {
              type: CdnIdType.VERCEL_BLOB_USER_IMAGE,
              cdnId: thumbnailId,
            },
            mediaCdn: {
              type: CdnIdType.VERCEL_BLOB_USER_VIDEO,
              cdnId: videoId,
            },
            aspectRatio,
          };

          const userAssetItem:
            Omit<UserAssetGalleryItem, "owner" | "_id" | "parentGalleryId">
            & { parentGalleryId: string } = {
              ...itemCreationData,
              itemType: GalleryItemTypes.UserAsset,
              media: userMedia,
            };

          itemCreationData = userAssetItem;
        } else {
          // Handle image upload (existing logic)
          const fileExtension = getFileExtension(uploadedImageFile!);
          const originalFilename = uploadedImageFile!.name.trim();
          
          const sanitizedFilename = originalFilename && originalFilename.length > 0
            ? sanitizeFilename(originalFilename)
            : `${crypto.randomUUID()}${fileExtension}`;
          
          const imageId = sanitizedFilename && sanitizedFilename.length > 0
            ? sanitizedFilename
            : `${crypto.randomUUID()}${fileExtension}`;

          const blobKey = makeUserImageBlobKey(
            userId,
            UploadCategory.UPLOADED_IMAGE,
            imageId
          );

          toast.info("Uploading image...");
          await clientImageUpload(uploadedImageFile!, blobKey);

          const aspectRatio = previewImage?.aspectRatio || await getFileAspectRatio(uploadedImageFile!);

          const userImage: UserImage = {
            origin: MediaOrigin.User,
            category: MediaCategory.Image,
            imageCdn: {
              type: CdnIdType.VERCEL_BLOB_USER_IMAGE,
              cdnId: imageId,
            },
            aspectRatio,
          };

          const userAssetItem:
            Omit<UserAssetGalleryItem, "owner" | "_id" | "parentGalleryId">
            & { parentGalleryId: string } = {
              ...itemCreationData,
              itemType: GalleryItemTypes.UserAsset,
              media: userImage,
            };

          itemCreationData = userAssetItem;
        }
      } catch (error) {
        handleClientError({
          error,
          location: "NewItemForm_onSubmit_UserAsset",
        });
        
        if (error instanceof Error) {
          toast.error(error.message || "Failed to upload media. Please try again.");
        } else {
          toast.error("Failed to upload media. Please try again.");
        }
        setSubmitting(false);
        return;
      }
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
          ref={ref}
          onClick={onClick}
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
                uploadedImageFile={uploadedImageFile}
                setUploadedImageFile={setUploadedImageFile}
                previewImage={previewImage}
                setPreviewImage={setPreviewImage}
                uploadedVideoFile={uploadedVideoFile}
                setUploadedVideoFile={setUploadedVideoFile}
                previewVideoUrl={previewVideoUrl}
                setPreviewVideoUrl={setPreviewVideoUrl}
                uploadedThumbnailFile={uploadedThumbnailFile}
                setUploadedThumbnailFile={setUploadedThumbnailFile}
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
            onClick={() => handleChooseContent(GalleryItemTypes.UserAsset)}
            variant="default"
            className="rounded-lg w-full h-26 has-[>svg]:px-6 text-md flex justify-start items-center gap-6 whitespace-normal"
          >
            <UserAssetEntryIcon className="size-12 text-neutral-400" />
            <div className="text-left min-w-0">
              <P className="font-bold text-lg ">
                {USER_ASSET_GALLERY_ITEM_COPY.title}
              </P>
              <P className="text-sm text-neutral-400">
                {USER_ASSET_GALLERY_ITEM_COPY.description}
              </P>
            </div>
          </Button>

          <Button
            onClick={() => handleChooseContent(GalleryItemTypes.Text)}
            variant="secondary"
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
});

NewItemForm.displayName = "NewItemForm";

export default NewItemForm;