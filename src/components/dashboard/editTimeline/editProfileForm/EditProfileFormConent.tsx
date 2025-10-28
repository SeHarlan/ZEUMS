import { TimelineOnboardingKeys, useTimelineSetter } from "@/atoms/onboarding/editTimeline";
import { BannerImage } from "@/components/timeline/BannerImage";
import { ProfileImage } from "@/components/timeline/ProfileImage";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input, PrefixInput } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ProfileDisplayFormValues } from "@/forms/editProfileDisplayInformation";
import { EntrySource } from "@/types/entry";
import { ImageType } from "@/types/media";
import { UserType } from "@/types/user";
import { socialHandlesList } from "@/utils/ui-utils";
import { getDisplayName } from "@/utils/user";
import { ImagePlusIcon } from "lucide-react";
import { FC, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import ChooseProfileImageDialog from "../../editProfile/ChooseImageDialog";
;

interface EditProfileFormContentProps {
  user: UserType | null;
  form: UseFormReturn<ProfileDisplayFormValues>;
  bannerImage?: ImageType;
  profileImage?: ImageType;
  setProfileImage: (image?: ImageType) => void;
  setBannerImage: (image?: ImageType) => void;
}
const EditProfileFormContent: FC<EditProfileFormContentProps> = ({
  user,
  form,
  bannerImage,
  profileImage,
  setProfileImage,
  setBannerImage,
}) => {
  const [profileImageOpen, setProfileImageOpen] = useState(false);
  const [bannerImageOpen, setBannerImageOpen] = useState(false);

  const {setStepRef: setPrimaryTimelineRef} = useTimelineSetter(
    TimelineOnboardingKeys.ChoosePrimaryTimeline
  );

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
      <div className="relative w-full h-fit">
        <Button
          type="button"
          variant={user?.bannerImage ? "outline" : "default"}
          size="icon"
          className="absolute -top-2 -right-2 z-10 "
          onClick={() => setBannerImageOpen(true)}
        >
          <ImagePlusIcon />
        </Button>
        <BannerImage
          media={bannerImage}
          className="text-5xl"
          fallbackText={getDisplayName(user) || "Z"}
        />
      </div>
      <div className="w-full flex gap-3 sm:gap-6 flex-row items-center">
        <div className="relative size-20 sm:size-26 flex-shrink-0">
          <Button
            type="button"
            variant={user?.profileImage ? "outline" : "default"}
            size="icon"
            className="absolute top-0 right-0 z-10 "
            onClick={() => setProfileImageOpen(true)}
          >
            <ImagePlusIcon />
          </Button>
          <ProfileImage
            media={profileImage}
            fallbackText={getDisplayName(user).charAt(0).toUpperCase() || "Z"}
            className="text-4xl sm:text-6xl border-3"
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