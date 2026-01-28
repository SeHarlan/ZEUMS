"use client";

import { editTimelineSettingsFormOpenAtom } from "@/atoms/dashboard";
import SideDrawer from "@/components/general/SideDrawer";
import { P } from "@/components/typography/Typography";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { USER_ROUTE } from "@/constants/serverRoutes";
import { UploadCategory } from "@/constants/uploadCategories";
import { useUser } from "@/context/UserProvider";
import {
  timelineSettingsFormSchema,
  TimelineSettingsFormValues,
} from "@/forms/editTimelineSettings";
import { EntrySource } from "@/types/entry";
import { CdnIdType, ImageType, MediaCategory, MediaOrigin } from "@/types/media";
import { UserType } from "@/types/user";
import {
  clientImageUpload,
  getFileExtension,
  makeUserImageBlobKey,
} from "@/utils/clientImageUpload";
import { handleClientError } from "@/utils/handleError";
import { getFileAspectRatio } from "@/utils/media";
import { cn } from "@/utils/ui-utils";
import { parseUserDates } from "@/utils/user";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useAtom } from "jotai";
import { SettingsIcon } from "lucide-react";
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import EditTimelineSettingsFormContent from "./EditTimelineSettingsFormContent";

const formId = "edit-timeline-settings-form";

interface EditTimelineSettingsFormProps {
  buttonClassName?: string;
  buttonVariant?: "default" | "outline" | "ghost" | "link";
  buttonText?: string;
  onClick?: () => void;
  disableInteractOutside?: boolean;
}

const EditTimelineSettingsForm = forwardRef<
  HTMLButtonElement,
  EditTimelineSettingsFormProps
>(
  (
    {
      buttonClassName = "w-full",
      buttonVariant = "default",
      buttonText = "Edit Settings",
      onClick,
      disableInteractOutside = false,
    },
    ref
  ) => {
    const { user, setUser } = useUser();
    const [formOpen, setFormOpen] = useAtom(editTimelineSettingsFormOpenAtom);
    const [submitting, setSubmitting] = useState(false);

    const [backgroundImage, setBackgroundImage] = useState<ImageType | null>(
      user?.backgroundImage ?? null
    );
    const [uploadedBackgroundFile, setUploadedBackgroundFile] = useState<
      File | undefined
    >();
    const originalBackgroundImageRef = useRef<ImageType | null | undefined>(
      user?.backgroundImage
    );

    const setBackgroundImageAndClearUpload = (image: ImageType | null) => {
      // Clean up previous object URL if it exists
      if (backgroundImage?.imageCdn?.cdnId?.startsWith("blob:")) {
        URL.revokeObjectURL(backgroundImage.imageCdn.cdnId);
      }
      // If picking a blockchain image or deleting, clear any queued upload.
      setUploadedBackgroundFile(undefined);
      setBackgroundImage(image);
    };

    const defaultValues: TimelineSettingsFormValues = useMemo(
      () => ({
        primaryTimeline: user?.primaryTimeline || EntrySource.Collector,
        hideCreatorDates: user?.hideCreatorDates ?? false,
        hideCollectorDates: user?.hideCollectorDates ?? true,
        backgroundTintHex: user?.backgroundTintHex ?? "#000000",
        backgroundTintOpacity: user?.backgroundTintOpacity ?? 0.35,
        backgroundBlur: user?.backgroundBlur ?? 0,
      }),
      [user]
    );

    const formHook = useForm<TimelineSettingsFormValues>({
      resolver: zodResolver(timelineSettingsFormSchema),
      defaultValues,
    });

    const { reset } = formHook;

    const handleOpenChange = (newOpen: boolean) => {
      if (!submitting) {
        setFormOpen(newOpen);
        if (!newOpen) {
          reset();
          setUploadedBackgroundFile(undefined);
          setBackgroundImage(user?.backgroundImage ?? null);
        }
      }
    };

    useEffect(() => {
      if (formOpen) {
        reset(defaultValues);
      }
    }, [defaultValues, formOpen, reset]);

    const handleBackgroundFileSelect = async (file: File) => {
      // Clean up previous object URL if it exists
      if (backgroundImage?.imageCdn?.cdnId?.startsWith("blob:")) {
        URL.revokeObjectURL(backgroundImage.imageCdn.cdnId);
      }

      setUploadedBackgroundFile(file);

      const objectUrl = URL.createObjectURL(file);

      try {
        const aspectRatio = await getFileAspectRatio(file);

        const tempImage: ImageType = {
          origin: MediaOrigin.User,
          category: MediaCategory.Image,
          imageCdn: {
            type: CdnIdType.VERCEL_BLOB_USER_IMAGE,
            cdnId: objectUrl,
          },
          aspectRatio,
        };

        setBackgroundImage(tempImage);
      } catch (error) {
        console.error("Failed to calculate background image aspect ratio:", error);
        toast.error("Something's gone wrong", {
          description: "Try again or choose a different image",
        });
      }
    };

    const onSubmit = formHook.handleSubmit(async (data) => {
      setSubmitting(true);

      try {
        if (!user?._id) {
          toast.error("User must be logged in.");
          return;
        }

        const userId = user._id.toString();

        const normalizeImage = (
          image: ImageType | null | undefined
        ): ImageType | null => image ?? null;

        let finalBackgroundImage: ImageType | null = normalizeImage(backgroundImage);

        const isNewBackgroundUpload =
          backgroundImage?.origin === MediaOrigin.User &&
          uploadedBackgroundFile &&
          backgroundImage !== originalBackgroundImageRef.current;

        if (isNewBackgroundUpload) {
          const fileExtension = getFileExtension(uploadedBackgroundFile);
          const imageId = `image${fileExtension}`;
          const blobKey = makeUserImageBlobKey(
            userId,
            UploadCategory.PROFILE_BACKGROUND,
            imageId
          );

          toast.info(`Uploading new background image...`);

          await clientImageUpload(uploadedBackgroundFile, blobKey);

          const aspectRatio =
            backgroundImage.aspectRatio ||
            (await getFileAspectRatio(uploadedBackgroundFile));

          finalBackgroundImage = {
            origin: MediaOrigin.User,
            category: MediaCategory.Image,
            imageCdn: {
              type: CdnIdType.VERCEL_BLOB_USER_IMAGE,
              cdnId: imageId,
            },
            aspectRatio,
          };
        }

        const shouldPatchBackgroundImage =
          isNewBackgroundUpload ||
          normalizeImage(backgroundImage) !==
            normalizeImage(originalBackgroundImageRef.current);

        const userData: Partial<UserType> = {
          primaryTimeline: data.primaryTimeline,
          hideCreatorDates: data.hideCreatorDates,
          hideCollectorDates: data.hideCollectorDates,
          ...(shouldPatchBackgroundImage
            ? { backgroundImage: finalBackgroundImage }
            : {}),
          backgroundTintHex: data.backgroundTintHex,
          backgroundTintOpacity: data.backgroundTintOpacity,
          backgroundBlur: data.backgroundBlur,
        };

        const response = await axios.patch<{ user: UserType }>(
          USER_ROUTE,
          userData
        );

        toast.success("Timeline settings updated!");
        setUser(parseUserDates(response.data.user));
        setFormOpen(false);
      } catch (error) {
        handleClientError({
          error,
          location: "EditTimelineSettingsForm_onSubmit",
        });
        toast.error("Failed to update timeline settings.");
      } finally {
        setSubmitting(false);
      }
    });

    // Reset uploaded files and clean up blob URLs when drawer toggles
    useEffect(() => {
      setUploadedBackgroundFile(undefined);

      if (formOpen) {
        originalBackgroundImageRef.current = user?.backgroundImage;
        setBackgroundImage(user?.backgroundImage ?? null);
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formOpen]);

    return (
      <SideDrawer
        disableInteractOutside={disableInteractOutside}
        triggerButton={
          <Button
            className={cn("w-fit", buttonClassName)}
            variant={buttonVariant}
            ref={ref}
            onClick={onClick}
          >
            <P>{buttonText}</P>
            <SettingsIcon className="hidden sm:block" />
          </Button>
        }
        open={formOpen}
        onOpenChange={handleOpenChange}
        title="Timeline Settings"
        description="Choose your primary timeline and adjust how dates are displayed."
        actionButton={
          <Button
            form={formId}
            type="submit"
            className="w-full"
            loading={submitting}
            onClick={onSubmit}
          >
            <P>Save Settings</P>
          </Button>
        }
      >
        <Form {...formHook}>
          <form id={formId}>
            <EditTimelineSettingsFormContent
              user={user}
              form={formHook}
              backgroundImage={backgroundImage}
              setBackgroundImage={setBackgroundImageAndClearUpload}
              onBackgroundFileSelect={handleBackgroundFileSelect}
            />
          </form>
        </Form>
      </SideDrawer>
    );
  }
);

EditTimelineSettingsForm.displayName = "EditTimelineSettingsForm";

export default EditTimelineSettingsForm;

