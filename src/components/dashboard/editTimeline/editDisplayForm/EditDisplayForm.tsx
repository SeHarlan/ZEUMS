import SideDrawer from "@/components/general/SideDrawer"
import { P } from "@/components/typography/Typography"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { USER_ROUTE } from "@/constants/serverRoutes"
import { useUser } from "@/context/UserProvider"
import { profileDisplayFormSchema, ProfileDisplayFormValues } from "@/forms/editProfileDisplayInformation"
import { EntrySource } from "@/types/entry"
import { UserType } from "@/types/user"
import { addHttpsPrefix } from "@/utils/general"
import { handleClientError } from "@/utils/handleError"
import { cn } from "@/utils/ui-utils"
import { parseUserDates } from "@/utils/user"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { SettingsIcon } from "lucide-react"
import { FC, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import EditDisplayFormContent from "./EditDisplayFormConent"

const formId = "edit-display-panel-form";

interface EditDisplayPanelProps {
  buttonClassName?: string;
  buttonVariant?: "default" | "outline" | "ghost" | "link";
  buttonText?: string;
}
const EditDisplayForm: FC<EditDisplayPanelProps> = ({
  buttonClassName = "w-full",
  buttonVariant = "default",
  buttonText = "Edit Profile",
}) => {
  const { user, setUser } = useUser();
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [profileImage, setProfileImage] = useState(user?.profileImage);
  const [bannerImage, setBannerImage] = useState(user?.bannerImage);


  const defaultValues: Partial<ProfileDisplayFormValues> = {
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
  };

  const form = useForm<ProfileDisplayFormValues>({
    resolver: zodResolver(profileDisplayFormSchema),
    defaultValues,
  });

  const handleOpenChange = (newOpen: boolean) => {
    if (!submitting) {
      setFormOpen(newOpen);
      if (!newOpen) {
        form.reset();
      }
    }
  };
  
  const onSubmit = (data: ProfileDisplayFormValues) => {
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
        toast.success("Display information updated successfully!");
        const userData = parseUserDates(response.data.user);
        setUser(userData);
      })
      .catch((error) => {
        handleClientError({
          error,
          location: "EditDisplayPanel_onSubmit",
        });
        toast.error("Failed to update display information.");
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  useEffect(() => {
    if (user?.profileImage && !profileImage)
      setProfileImage(user.profileImage);
  }, [user?.profileImage, profileImage]);

  useEffect(() => {
    if (user?.bannerImage && !bannerImage) setBannerImage(user.bannerImage);
  }, [user?.bannerImage, bannerImage]);
  
  return (
    <SideDrawer
      triggerButton={
        <Button
          className={cn("w-full", buttonClassName)}
          variant={buttonVariant}
        >
          <P>{buttonText}</P>
          <SettingsIcon className="hidden sm:block"/>
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
        >
          <P>Save</P>
        </Button>
      }
    >
      <Form {...form}>
        <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
          <EditDisplayFormContent
            user={user}
            form={form}
            setProfileImage={setProfileImage}
            setBannerImage={setBannerImage}
            bannerImage={bannerImage}
            profileImage={profileImage}
          />
        </form>
      </Form>
    </SideDrawer>
  );
};

export default EditDisplayForm;