"use client";
import { addTimelineEntriesFormOpenAtom } from "@/atoms/dashboard";
import SideDrawer from "@/components/general/SideDrawer";
import {
  BlockchainAssetEntryIcon,
  GalleryEntryIcon,
  TextEntryIcon,
  UserAssetEntryIcon,
} from "@/components/icons/EntryTypes";
import { P } from "@/components/typography/Typography";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { ENTRY_DATES_ROUTE, ENTRY_ROUTE } from "@/constants/serverRoutes";
import { UploadCategory } from "@/constants/uploadCategories";
import { useUser } from "@/context/UserProvider";
import { entryFormSchema, EntryFormValues } from "@/forms/upsertEntry";
import {
  BLOCKCHAIN_ENTRY_COPY,
  ENTRY_TYPE_COPY,
  GALLERY_ENTRY_COPY,
  TEXT_ENTRY_COPY,
  USER_ASSET_ENTRY_COPY,
} from "@/textCopy/entryTypes";
import { TIMELINE_ENTRY_LABEL } from "@/textCopy/mainCopy";
import { DateMap, ParsedBlockChainAsset } from "@/types/asset";
import {
  EntrySource,
  EntryTypes,
  TimelineEntry,
  TimelineEntryCreation,
  UserAssetEntry,
} from "@/types/entry";
import { UserVirtualGalleryType } from "@/types/gallery";
import { CdnIdType, MediaCategory, MediaOrigin, UserImage, UserMedia } from "@/types/media";
import { clientImageUpload, getFileExtension, getVideoFileExtension, makeUserImageBlobKey, makeUserVideoBlobKey, sanitizeFilename } from "@/utils/clientImageUpload";
import { clientVideoUpload } from "@/utils/clientVideoUpload";
import { getFirstBlockchainItem } from "@/utils/gallery";
import { addHttpsPrefix } from "@/utils/general";
import { handleClientError } from "@/utils/handleError";
import { getFileAspectRatio } from "@/utils/media";
import {
  addPreciseCurrentTime,
  getTimelineKey,
  parseEntryDate,
  sortTimeline,
} from "@/utils/timeline";
import { cn } from "@/utils/ui-utils";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useAtom } from "jotai";
import { ArrowLeftIcon, ImagePlusIcon } from "lucide-react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import AddBlockchainEntriesButton from "../AddBlockchainEntries";
import NewEntryFormContent from "./NewEntryFormContent";

const formId = "new-entry-form";
const defaultTitle = `Add ${TIMELINE_ENTRY_LABEL.capPlural}`;

interface NewEntryFormProps {
  buttonClassName?: string;
  buttonVariant?: "default" | "outline" | "ghost" | "link" | "secondary";
  buttonText?: string;
  source: EntrySource;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disableInteractOutside?: boolean;
}

const NewEntryForm = forwardRef<HTMLButtonElement, NewEntryFormProps>(
  (
    {
      source,
      buttonClassName,
      buttonVariant = "default",
      buttonText = defaultTitle,
      onClick,
      disableInteractOutside = false,
    },
    ref
  ) => {
    const { user, setUser } = useUser();
    const [formOpen, setFormOpen] = useAtom(addTimelineEntriesFormOpenAtom);
    const [submitting, setSubmitting] = useState(false);
    const [fetchingMintDate, setFetchingMintDate] = useState(false);
    const [blockchainAsset, setBlockchainAsset] =
      useState<ParsedBlockChainAsset | null>(null);
    const [gallery, setGallery] = useState<UserVirtualGalleryType | null>(null);
    const [aspectRatio, setAspectRatio] = useState<number | null>(null);
    const [contentChosen, setContentChosen] = useState(false);
    const [uploadedImageFile, setUploadedImageFile] = useState<File | undefined>();
    const [previewImage, setPreviewImage] = useState<{ url: string; aspectRatio: number } | null>(null);
    const [uploadedVideoFile, setUploadedVideoFile] = useState<File | undefined>();
    const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
    const [uploadedThumbnailFile, setUploadedThumbnailFile] = useState<File | undefined>();

    const prevEntryTypeRef = useRef<EntryTypes>(EntryTypes.BlockchainAsset);

    const defaultValues: EntryFormValues = useMemo(
      () => ({
        entryType: EntryTypes.Text,
        title: "",
        description: "",
        date: new Date(),
        buttons: [],
      }),
      []
    );

    const formHook = useForm<EntryFormValues>({
      resolver: zodResolver(entryFormSchema),
      defaultValues,
    });

    const { reset, watch } = formHook;

    // eslint-disable-next-line react-hooks/incompatible-library
    const selectedEntryType = watch("entryType");

 
    const disableSubmit =
      (selectedEntryType === EntryTypes.BlockchainAsset && !blockchainAsset) ||
      (selectedEntryType === EntryTypes.Gallery && !gallery) ||
      (selectedEntryType === EntryTypes.UserAsset && 
        !uploadedImageFile && !uploadedVideoFile) ||
      (selectedEntryType === EntryTypes.UserAsset && 
        uploadedVideoFile && !uploadedThumbnailFile);

    const timelineKey = getTimelineKey(source);

    const blockchainAddText =
      source === EntrySource.Creator ? "created" : "collected";

    const getHeaderText = () => {
      if (contentChosen) {
        return ENTRY_TYPE_COPY[selectedEntryType];
      }

      return {
        title: defaultTitle,
        description: `Connect galleries or add content to your ${source} timeline.`,
      };
    };
    const headerText = getHeaderText();

    const handleChooseContent = (entryType: EntryTypes) => {
      setContentChosen(true);
      formHook.setValue("entryType", entryType);
    };

    const handleGetMintDates = useCallback(async (tokenAddress?: string) => {
      if (!tokenAddress) return new Date();

      setFetchingMintDate(true);
      return axios
        .post<{ addressDatesMap: DateMap }>(ENTRY_DATES_ROUTE, {
          mintAddresses: [tokenAddress],
        })
        .then((response) => {
          const { addressDatesMap } = response.data;
          const mintDate = addressDatesMap[tokenAddress];

          if (!mintDate) {
            throw new Error("No date returned");
          }

          toast.success("Mint date successfully retrieved!");
          return new Date(mintDate);
        })
        .catch((error) => {
          toast.error("Failed to get the mint date.", {
            description: "Please try again or set the date manually",
          });
          handleClientError({
            error,
            location: "NewEntryForm_handleGetMintDates",
          });
          return new Date();
        })
        .finally(() => {
          setFetchingMintDate(false);
        });
    }, []);

    useEffect(() => {
      //initialize item details if they exist
      if (selectedEntryType === EntryTypes.BlockchainAsset) {
        handleGetMintDates(blockchainAsset?.tokenAddress).then((mintDate) => {
          reset((values) => ({
            ...values,
            entryType: EntryTypes.BlockchainAsset,
            title: blockchainAsset?.title || "",
            description: blockchainAsset?.description || "",
            date: mintDate,
          }));
        });
      }
    }, [blockchainAsset, handleGetMintDates, reset, selectedEntryType]);

    useEffect(() => {
      if (selectedEntryType === EntryTypes.Gallery) {
        const firstItem = getFirstBlockchainItem(gallery?.items);
        handleGetMintDates(firstItem?.tokenAddress).then((mintDate) => {
          reset((values) => ({
            ...values,
            entryType: EntryTypes.Gallery,
            title: gallery?.title || "",
            description: gallery?.description || "",
            date: mintDate,
          }));
        });
      }
    }, [selectedEntryType, reset, gallery, handleGetMintDates]);

    useEffect(() => {
      // Only reset if selectedEntryType changed
      if (selectedEntryType !== prevEntryTypeRef.current) {
        setBlockchainAsset(null);
        // Clean up previews when switching entry types
        if (prevEntryTypeRef.current === EntryTypes.UserAsset) {
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
        }
        reset((values) => ({
          ...values,
          entryType: selectedEntryType,
        }));
        prevEntryTypeRef.current = selectedEntryType;
      }
    }, [selectedEntryType, reset, previewImage, previewVideoUrl]);

    const fullFormReset = () => {
      //don't rest state till drawer has fully closed
      setTimeout(() => {
        setBlockchainAsset(null);
        setGallery(null);
        setAspectRatio(null);
        setUploadedImageFile(undefined);
        setUploadedVideoFile(undefined);
        setUploadedThumbnailFile(undefined);
        // Clean up blob URLs if they exist
        if (previewImage?.url.startsWith("blob:")) {
          URL.revokeObjectURL(previewImage.url);
        }
        if (previewVideoUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(previewVideoUrl);
        }
        setPreviewImage(null);
        setPreviewVideoUrl(null);
        reset();
        prevEntryTypeRef.current = EntryTypes.BlockchainAsset;
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

    const onSubmit = async (data: EntryFormValues) => {
      setSubmitting(true);

      data.date = addPreciseCurrentTime(data.date);

      // Add https:// prefix to button URLs if they don't have a protocol
      if (data.buttons) {
        data.buttons = data.buttons.map((button) => ({
          ...button,
          url: addHttpsPrefix(button.url),
        }));
      }

      let entryCreationData: TimelineEntryCreation = {
        ...data,
        source,
      };

      if (data.entryType === EntryTypes.BlockchainAsset) {
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

        entryCreationData = {
          ...assetWithAspectRatio,
          ...entryCreationData,
        };
      }

      if (data.entryType === EntryTypes.Gallery && gallery) {
        entryCreationData = {
          ...entryCreationData,
          galleryId: gallery._id.toString(),
        };
      }

      if (data.entryType === EntryTypes.UserAsset) {
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

            const userAssetEntry: Omit<UserAssetEntry, "owner" | "_id"> = {
              ...entryCreationData,
              entryType: EntryTypes.UserAsset,
              media: userMedia,
            };

            entryCreationData = userAssetEntry;
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

            const userAssetEntry: Omit<UserAssetEntry, "owner" | "_id"> = {
              ...entryCreationData,
              entryType: EntryTypes.UserAsset,
              media: userImage,
            };

            entryCreationData = userAssetEntry;
          }
        } catch (error) {
          handleClientError({
            error,
            location: "NewEntryForm_onSubmit_UserAsset",
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
        .post<{ createdEntry: TimelineEntry }>(ENTRY_ROUTE, entryCreationData)
        .then((response) => {
          const { createdEntry } = response.data;
          const parsedCreatedEntry = parseEntryDate(createdEntry);

          toast.success(
            `New ${TIMELINE_ENTRY_LABEL.fullSingular} created successfully!`
          );

          //Update the users timeline context with the new entry
          setUser((prevUser) => {
            if (!prevUser) return prevUser;

            const prevTimeline = prevUser[timelineKey] || [];

            const newTimeline = sortTimeline([
              parsedCreatedEntry,
              ...prevTimeline,
            ]);

            return {
              ...prevUser,
              [timelineKey]: newTimeline,
            };
          });

          setFormOpen(false);
          fullFormReset();
        })
        .catch((error) => {
          toast.error(
            `Failed to create new ${TIMELINE_ENTRY_LABEL.fullSingular}.`
          );
          handleClientError({
            error,
            location: "NewEntryForm_onSubmit",
          });
        })
        .finally(() => {
          setSubmitting(false);
        });
    }

    return (
      <SideDrawer
        disableInteractOutside={disableInteractOutside}
        triggerButton={
          <Button
            className={cn("w-full", buttonClassName)}
            variant={buttonVariant}
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
              onClick={formHook.handleSubmit(onSubmit)}
            >
              <P>Save {ENTRY_TYPE_COPY[selectedEntryType].title}</P>
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
            <Form {...formHook}>
              <form id={formId}>
                <NewEntryFormContent
                  fetchingMintDate={fetchingMintDate}
                  handleGetMintDates={handleGetMintDates}
                  form={formHook}
                  selectedEntryType={selectedEntryType}
                  blockchainAsset={blockchainAsset}
                  setBlockchainAsset={setBlockchainAsset}
                  gallery={gallery}
                  setGallery={setGallery}
                  setAspectRatio={setAspectRatio}
                  source={source}
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
            <AddBlockchainEntriesButton
              source={source}
              onSave={() => setFormOpen(false)}
            >
              <Button
                variant="default"
                className="rounded-lg w-full h-26 has-[>svg]:px-6 text-md flex justify-start items-center gap-6 whitespace-normal"
              >
                <BlockchainAssetEntryIcon className="size-12 text-neutral-400" />
                <div className="text-left min-w-0">
                  <P className="font-bold text-lg ">
                    {BLOCKCHAIN_ENTRY_COPY.title}
                  </P>
                  <P className="text-sm text-neutral-400">
                    {BLOCKCHAIN_ENTRY_COPY.description}s you {blockchainAddText}
                  </P>
                </div>
              </Button>
            </AddBlockchainEntriesButton>

            <Button
              onClick={() => handleChooseContent(EntryTypes.UserAsset)}
              variant="default"
              className="rounded-lg w-full h-26 has-[>svg]:px-6 text-md flex justify-start items-center gap-6 whitespace-normal"
            >
              <UserAssetEntryIcon className="size-12 text-neutral-400" />
              <div className="text-left min-w-0">
                <P className="font-bold text-lg ">
                  {USER_ASSET_ENTRY_COPY.title}
                </P>
                <P className="text-sm text-neutral-400">
                  {USER_ASSET_ENTRY_COPY.description}
                </P>
              </div>
            </Button>

            <Button
              onClick={() => handleChooseContent(EntryTypes.Text)}
              variant="secondary"
              className="rounded-lg w-full h-26 has-[>svg]:px-6 text-md flex justify-start items-center gap-6 whitespace-normal"
            >
              <TextEntryIcon className="size-12 text-muted-foreground" />

              <div className="text-left min-w-0">
                <P className="font-bold text-lg">{TEXT_ENTRY_COPY.title}</P>
                <P className="text-sm text-muted-foreground">
                  {TEXT_ENTRY_COPY.description}
                </P>
              </div>
            </Button>
            <Button
              variant="secondary"
              className="rounded-lg w-full h-26 has-[>svg]:px-6 text-md flex justify-start items-center gap-6 whitespace-normal"
              onClick={() => handleChooseContent(EntryTypes.Gallery)}
            >
              <GalleryEntryIcon className="size-12 text-neutral-400" />
              <div className="text-left min-w-0">
                <P className="font-bold text-lg ">{GALLERY_ENTRY_COPY.title}</P>
                <P className="text-sm text-neutral-400">
                  {GALLERY_ENTRY_COPY.description} you {blockchainAddText}
                </P>
              </div>
            </Button>
          </div>
        )}
      </SideDrawer>
    );
  }
);

NewEntryForm.displayName = "NewEntryForm";

export default NewEntryForm;
