"use client";

import { editProfileFormOpenAtom } from "@/atoms/dashboard";
import {
  TimelineOnboardingKeys,
  useTimelineSetter,
} from "@/atoms/onboarding/editTimeline";
import SideDrawer from "@/components/general/SideDrawer";
import { P } from "@/components/typography/Typography";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { USER_ROUTE } from "@/constants/serverRoutes";
import { UploadCategory } from "@/constants/uploadCategories";
import { useUser } from "@/context/UserProvider";
import { profileDisplayFormSchema, ProfileDisplayFormValues } from "@/forms/editProfileDisplayInformation";
import { EntrySource } from "@/types/entry";
import { CdnIdType, MediaCategory, MediaOrigin } from "@/types/media";
import { UserType } from "@/types/user";
import { clientImageUpload, getFileExtension, makeUserImageBlobKey } from "@/utils/clientImageUpload";
import { addHttpsPrefix } from "@/utils/general";
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
import EditProfileFormContent from "./EditProfileFormConent";

const formId = "edit-profile-form";

interface EditDisplayPanelProps {
  buttonClassName?: string;
  buttonVariant?: "default" | "outline" | "ghost" | "link";
  buttonText?: string;
  onClick?: () => void;
  disableInteractOutside?: boolean;
}

const EditProfileForm = forwardRef<HTMLButtonElement, EditDisplayPanelProps>(
  (
    {
      buttonClassName = "w-full",
      buttonVariant = "default",
      buttonText = "Edit Profile",
      onClick,
      disableInteractOutside = false,
    },
    ref
  ) => {
    const { user, setUser } = useUser();
    const [formOpen, setFormOpen] = useAtom(editProfileFormOpenAtom);
    const [submitting, setSubmitting] = useState(false);

    const [profileImage, setProfileImage] = useState(user?.profileImage);
    const [bannerImage, setBannerImage] = useState(user?.bannerImage);
    const [uploadedProfileFile, setUploadedProfileFile] = useState<File | undefined>();
    const [uploadedBannerFile, setUploadedBannerFile] = useState<File | undefined>();
    
    // Track original images to detect new uploads (using ref to avoid unnecessary re-renders)
    const originalProfileImageRef = useRef(user?.profileImage);
    const originalBannerImageRef = useRef(user?.bannerImage);

    const {
      setStepRef: setSaveProfileRef,
      setStepComplete: setSaveProfileComplete,
    } = useTimelineSetter(TimelineOnboardingKeys.SaveProfile);

    const defaultValues: ProfileDisplayFormValues = useMemo(
      () => ({
        displayName: user?.displayName || "",
        bio: user?.bio || "",
        socialHandles: {
          x: user?.socialHandles?.x || "",
          instagram: user?.socialHandles?.instagram || "",
          tiktok: user?.socialHandles?.tiktok || "",
          telegram: user?.socialHandles?.telegram || "",
          discord: user?.socialHandles?.discord || "",
          website: user?.socialHandles?.website || "",
          // facebook: user?.socialHandles?.facebook || "",
        },
        primaryTimeline: user?.primaryTimeline || EntrySource.Collector,
        hideCreatorDates: user?.hideCreatorDates ?? false,
        hideCollectorDates: user?.hideCollectorDates ?? true,
        // websites: user?.websites || [],
      }),
      [user]
    );

    const formHook = useForm<ProfileDisplayFormValues>({
      resolver: zodResolver(profileDisplayFormSchema),
      defaultValues,
    });

    const { reset } = formHook;

    const handleOpenChange = (newOpen: boolean) => {
      if (!submitting) {
        setFormOpen(newOpen);
        if (!newOpen) {
          reset();
        }
      }
    };

    const onSubmit = formHook.handleSubmit(async (data) => {
      setSubmitting(true);

      const socialHandles = data.socialHandles;

      if (socialHandles.website) {
        socialHandles.website = addHttpsPrefix(socialHandles.website);
      }

      if (!user?._id) {
        toast.error("User must be logged in.");
        setSubmitting(false);
        return;
      }

      const userId = user._id.toString();

      let finalProfileImage = profileImage;
      let finalBannerImage = bannerImage;

      try {
        // Check if profile image is a new User upload
        const isNewProfileUpload = 
          profileImage?.origin === MediaOrigin.User &&
          uploadedProfileFile &&
          profileImage !== originalProfileImageRef.current;

        if (isNewProfileUpload) {
          // Get file extension and create blob key
          const fileExtension = getFileExtension(uploadedProfileFile);
          const imageId = `image${fileExtension}`
          const blobKey = makeUserImageBlobKey(
            userId,
            UploadCategory.PROFILE_PICTURE,
            imageId
          );

          toast.info(`Uploading new profile image...`);

          // Upload to Vercel Blob
          await clientImageUpload(uploadedProfileFile, blobKey);
          
          // Calculate aspect ratio if not already set
          const aspectRatio = profileImage.aspectRatio || await getFileAspectRatio(uploadedProfileFile);

          // Create final UserImage object
          finalProfileImage = {
            origin: MediaOrigin.User,
            category: MediaCategory.Image,
            imageCdn: {
              type: CdnIdType.VERCEL_BLOB_USER_IMAGE,
              cdnId: imageId, // Just the id
            },
            aspectRatio,
          };
        }

        // Check if banner image is a new User upload
        const isNewBannerUpload = 
          bannerImage?.origin === MediaOrigin.User &&
          uploadedBannerFile &&
          bannerImage !== originalBannerImageRef.current;

        if (isNewBannerUpload) {
          // Get file extension and create blob key
          const fileExtension = getFileExtension(uploadedBannerFile);
          const imageId = `image${fileExtension}`
          const blobKey = makeUserImageBlobKey(
            userId,
            UploadCategory.PROFILE_BANNER,
            imageId
          );

          toast.info(`Uploading new banner image...`);

          // Upload to Vercel Blob
          await clientImageUpload(uploadedBannerFile, blobKey);
          
          // Calculate aspect ratio if not already set
          const aspectRatio = bannerImage.aspectRatio || await getFileAspectRatio(uploadedBannerFile);

          // Create final UserImage object
          finalBannerImage = {
            origin: MediaOrigin.User,
            category: MediaCategory.Image,
            imageCdn: {
              type: CdnIdType.VERCEL_BLOB_USER_IMAGE,
              cdnId: imageId, // Just the image id
            },
            aspectRatio,
          };
        }

        const userData: Partial<UserType> = {
          ...data,
          socialHandles,
          profileImage: finalProfileImage,
          bannerImage: finalBannerImage,
        };

        const response = await axios.patch<{ user: UserType }>(USER_ROUTE, userData);
        
        toast.success("Profile updated successfully!");
        const updatedUserData = parseUserDates(response.data.user);

        setUser(updatedUserData);
        setFormOpen(false);
        setSaveProfileComplete();
      } catch (error) {
        handleClientError({
          error,
          location: "EditProfileForm_onSubmit",
        });
        
        if (error instanceof Error) {
          toast.error(error.message || "Failed to update profile.");
        } else {
          toast.error("Failed to update profile.");
        }
      } finally {
        setSubmitting(false);
      }
    });

    // Reset uploaded files and clean up blob URLs when dialog closes
    useEffect(() => {
      setUploadedProfileFile(undefined);
      setUploadedBannerFile(undefined);
      
      if (formOpen) {
        // Reset to user's actual images (not blob: URLs)
        originalProfileImageRef.current = user?.profileImage;
        originalBannerImageRef.current = user?.bannerImage;
        setProfileImage(user?.profileImage);
        setBannerImage(user?.bannerImage);
      }

      //we only wanna run this effect when the formOpen state changes
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formOpen]);

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
            <SettingsIcon className="hidden sm:block" />
          </Button>
        }
        open={formOpen}
        onOpenChange={handleOpenChange}
        title="Edit Profile"
        description="Manage your public profile details, media, and settings to fine-tune how your timeline is displayed."
        actionButton={
          <Button
            form={formId}
            type="submit"
            className="w-full"
            loading={submitting}
            ref={setSaveProfileRef}
            onClick={onSubmit}
          >
            <P>Save Profile</P>
          </Button>
        }
      >

        <Form {...formHook}>
          <form  id={formId} >
            <EditProfileFormContent
              user={user}
              form={formHook}
              setProfileImage={setProfileImage}
              setBannerImage={setBannerImage}
              bannerImage={bannerImage}
              profileImage={profileImage}
              setUploadedProfileFile={setUploadedProfileFile}
              setUploadedBannerFile={setUploadedBannerFile}
            />
          </form>
        </Form>
      </SideDrawer>
    );
  }
);

EditProfileForm.displayName = "EditProfileForm";

export default EditProfileForm;
