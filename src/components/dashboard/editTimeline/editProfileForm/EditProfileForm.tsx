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
import { useUser } from "@/context/UserProvider";
import { profileDisplayFormSchema, ProfileDisplayFormValues } from "@/forms/editProfileDisplayInformation";
import { EntrySource } from "@/types/entry";
import { UserType } from "@/types/user";
import { addHttpsPrefix } from "@/utils/general";
import { handleClientError } from "@/utils/handleError";
import { cn } from "@/utils/ui-utils";
import { parseUserDates } from "@/utils/user";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useAtom } from "jotai";
import { SettingsIcon } from "lucide-react";
import { forwardRef, useEffect, useMemo, useState } from "react";
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

    const onSubmit = formHook.handleSubmit((data) => {
      setSubmitting(true);

      const socialHandles = data.socialHandles;

      if (socialHandles.website) {
        socialHandles.website = addHttpsPrefix(socialHandles.website);
      }

      const userData: Partial<UserType> = {
        ...data,
        socialHandles,
        profileImage,
        bannerImage,
      };

      axios
        .patch<{ user: UserType }>(USER_ROUTE, userData)
        .then((response) => {
          toast.success("Profile updated successfully!");
          const userData = parseUserDates(response.data.user);

          setUser(userData);
          setFormOpen(false);
          setSaveProfileComplete();
        })
        .catch((error) => {
          handleClientError({
            error,
            location: "EditProfileForm_onSubmit",
          });
          toast.error("Failed to update profile.");
        })
        .finally(() => {
          setSubmitting(false);
        });
    });

    useEffect(() => {
      if (user?.profileImage && !profileImage) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setProfileImage(user.profileImage);
      }
    }, [user?.profileImage, profileImage]);

    useEffect(() => {
      if (user?.bannerImage && !bannerImage) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setBannerImage(user.bannerImage);
      }
    }, [user?.bannerImage, bannerImage]);

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
            />
          </form>
        </Form>
      </SideDrawer>
    );
  }
);

EditProfileForm.displayName = "EditProfileForm";

export default EditProfileForm;
