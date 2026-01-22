import { TimelineOnboardingKeys, useTimelineSetter } from "@/atoms/onboarding/editTimeline";
import ImageUploadDialog from "@/components/media/ImageUploadDialog";
import { BannerImage } from "@/components/timeline/BannerImage";
import { ProfileImage } from "@/components/timeline/ProfileImage";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input, PrefixInput } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { UploadCategory } from "@/constants/uploadCategories";
import { ProfileDisplayFormValues } from "@/forms/editProfileDisplayInformation";
import { EntrySource } from "@/types/entry";
import { CdnIdType, ImageType, MediaCategory, MediaOrigin } from "@/types/media";
import { UserType } from "@/types/user";
import { getFileAspectRatio } from "@/utils/media";
import { socialHandlesList } from "@/utils/ui-utils";
import { getDisplayName } from "@/utils/user";
import { ImagePlusIcon } from "lucide-react";
import { FC, useMemo, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import ChooseProfileImageDialog from "../../editProfile/ChooseImageDialog";

interface EditProfileFormContentProps {
  user: UserType | null;
  form: UseFormReturn<ProfileDisplayFormValues>;
  bannerImage?: ImageType;
  profileImage?: ImageType;
  setProfileImage: (image?: ImageType) => void;
  setBannerImage: (image?: ImageType) => void;
  setUploadedProfileFile: (file: File | undefined) => void;
  setUploadedBannerFile: (file: File | undefined) => void;
}
const EditProfileFormContent: FC<EditProfileFormContentProps> = ({
  user,
  form,
  bannerImage,
  profileImage,
  setProfileImage,
  setBannerImage,
  setUploadedProfileFile,
  setUploadedBannerFile,
}) => {
  const [profileImageOpen, setProfileImageOpen] = useState(false);
  const [bannerImageOpen, setBannerImageOpen] = useState(false);
  const [uploadProfileDialogOpen, setUploadProfileDialogOpen] = useState(false);
  const [uploadBannerDialogOpen, setUploadBannerDialogOpen] = useState(false);

  const {setStepRef: setPrimaryTimelineRef} = useTimelineSetter(
    TimelineOnboardingKeys.ChoosePrimaryTimeline
  );

  const userId = user?._id?.toString();
  // Create blobUrlBuilderProps for user-uploaded images
  const profileBlobUrlBuilderProps = useMemo(() => {
    if (!userId) return undefined;
    return {
      userId,
      category: UploadCategory.PROFILE_PICTURE,
    };
  }, [userId]);

  const bannerBlobUrlBuilderProps = useMemo(() => {
    if (!userId) return undefined;
    return {
      userId,
      category: UploadCategory.PROFILE_BANNER,
    };
  }, [userId]);

  const handleProfileFileSelect = async (file: File) => {
    // Clean up previous object URL if it exists
    if (profileImage?.imageCdn?.cdnId?.startsWith("blob:")) {
      URL.revokeObjectURL(profileImage.imageCdn.cdnId);
    }
    
    setUploadedProfileFile(file);
    
    // Create object URL for preview and use it as cdnId
    const objectUrl = URL.createObjectURL(file);
    
    // Calculate aspect ratio
    try {
      const aspectRatio = await getFileAspectRatio(file);
      
      // Create temporary UserImage with object URL as cdnId for preview
      const tempImage: ImageType = {
        origin: MediaOrigin.User,
        category: MediaCategory.Image,
        imageCdn: {
          type: CdnIdType.VERCEL_BLOB_USER_IMAGE,
          cdnId: objectUrl, // Use object URL directly - constructor will detect it's a full blob URL
        },
        aspectRatio,
      };
      
      setProfileImage(tempImage);
    } catch (error) {
      console.error("Failed to calculate profile image aspect ratio:", error);
      
      toast.error("Something's gone wrong", {
        description: "Try again or choose a different image",
      });
    }
  };

  const handleBannerFileSelect = async (file: File) => {
    // Clean up previous object URL if it exists
    if (bannerImage?.imageCdn?.cdnId?.startsWith("blob:")) {
      URL.revokeObjectURL(bannerImage.imageCdn.cdnId);
    }
    
    setUploadedBannerFile(file);
    
    // Create object URL for preview and use it as cdnId
    const objectUrl = URL.createObjectURL(file);
    
    // Calculate aspect ratio
    try {
      const aspectRatio = await getFileAspectRatio(file);
      
      // Create temporary UserImage with object URL as cdnId for preview
      const tempImage: ImageType = {
        origin: MediaOrigin.User,
        category: MediaCategory.Image,
        imageCdn: {
          type: CdnIdType.VERCEL_BLOB_USER_IMAGE,
          cdnId: objectUrl, // Use object URL directly - constructor will detect it's a full URL
        },
        aspectRatio,
      };
      
      setBannerImage(tempImage);
    } catch (error) {
      console.error("Failed to calculate banner image aspect ratio:", error);
      
      toast.error("Something's gone wrong", {
        description: "Try again or choose a different image",
      });
    }
  };

  return (
    <div className="flex flex-col space-y-6 py-4">
      <FormField
        control={form.control}
        name="primaryTimeline"
        render={({ field }) => (
          <FormItem>
            <div className="grid gap-2"
              ref={setPrimaryTimelineRef}
            >
              <FormLabel>Primary Timeline</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="">
                    <SelectValue placeholder="Primary Timeline" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={EntrySource.Creator}>Created</SelectItem>
                  <SelectItem value={EntrySource.Collector}>
                    Collected
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                The timeline that will be displayed first when viewing your
                profile.
              </FormDescription>
              <FormMessage />
            </div>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="hideCreatorDates"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Hide Created Timeline Dates</FormLabel>

            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="hideCollectorDates"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Hide Collected Timeline Dates</FormLabel>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <Separator />
      
      <div className="relative w-full h-fit">
        <div className="absolute -top-2 -right-2 z-10 flex gap-2">
          <ImageUploadDialog
            title="Upload Banner Image"
            description="Upload an image from your device to use as your banner"
            onSelect={handleBannerFileSelect}
            open={uploadBannerDialogOpen}
            onOpenChange={setUploadBannerDialogOpen}
          />
          <Button
            type="button"
            variant={user?.bannerImage ? "outline" : "default"}
            size="icon"
            onClick={() => setBannerImageOpen(true)}
          >
            <ImagePlusIcon />
          </Button>
        </div>
        <BannerImage
          media={bannerImage}
          className="text-5xl"
          fallbackText={getDisplayName(user) || "Z"}
          blobUrlBuilderProps={bannerBlobUrlBuilderProps}
        />
      </div>
      <div className="w-full flex gap-3 sm:gap-6 flex-row items-center">
        <div className="relative size-20 sm:size-26 shrink-0">
          <div className="absolute top-0 right-0 z-10 flex gap-2">
            <ImageUploadDialog
              title="Upload Profile Image"
              description="Upload an image from your device to use as your profile picture"
              onSelect={handleProfileFileSelect}
              open={uploadProfileDialogOpen}
              onOpenChange={setUploadProfileDialogOpen}
              maxFileSize={15 * 1024 * 1024} //15MB
            />
            <Button
              type="button"
              variant={user?.profileImage ? "outline" : "default"}
              size="icon"
              onClick={() => setProfileImageOpen(true)}
            >
              <ImagePlusIcon />
            </Button>
          </div>
          <ProfileImage
            media={profileImage}
            fallbackText={getDisplayName(user).charAt(0).toUpperCase() || "Z"}
            className="text-4xl sm:text-6xl border-3"
            blobUrlBuilderProps={profileBlobUrlBuilderProps}
          />
        </div>

        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem className="w-full h-fit">
              <FormLabel>Display Name</FormLabel>
              <FormControl>
                <Input placeholder={getDisplayName(user, true)} {...field} />
              </FormControl>
              <FormDescription>
                This is how your name will be displayed
                {!user?.displayName ? " (defaults to username)" : ""}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="bio"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bio</FormLabel>
            <FormControl>
              <Textarea placeholder="This is my story..." {...field} />
            </FormControl>
            <FormDescription>
              A brief introduction to help others connect with you and your
              story
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger className="max-w-fit gap-2">
            Social Media Handles
          </AccordionTrigger>
          <AccordionContent className="space-y-4 sm:px-5">
            {socialHandlesList.map((handle) => (
              <FormField
                key={handle.key}
                control={form.control}
                name={`socialHandles.${handle.key}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{handle.label}</FormLabel>
                    <FormControl>
                      <PrefixInput
                        icon={
                          <handle.Icon className="size-5 text-muted-foreground/50" />
                        }
                        prefix={handle.baseUrl}
                        placeholder={handle.placeholder || "username"}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <ChooseProfileImageDialog
        imageVariant={"profile"}
        setSelectedMedia={setProfileImage}
        open={profileImageOpen}
        setOpen={setProfileImageOpen}
      />
      <ChooseProfileImageDialog
        imageVariant={"banner"}
        setSelectedMedia={setBannerImage}
        open={bannerImageOpen}
        setOpen={setBannerImageOpen}
      />
    </div>
  );
};

export default EditProfileFormContent;