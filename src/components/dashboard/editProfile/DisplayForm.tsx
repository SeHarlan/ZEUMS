"use client";
import { FC, useEffect, useState } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input, PrefixInput } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getDisplayName, parseUserDates } from "@/utils/user";
import { UserType  } from "@/types/user";
import { useForm } from "react-hook-form";
import { profileDisplayFormSchema, ProfileDisplayFormValues } from "@/forms/editProfileDisplayInformation";
import { useUser } from "@/context/UserProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { handleClientError } from "@/utils/handleError";
import { toast } from "sonner";
import axios from "axios";
import { USER_ROUTE } from "@/constants/serverRoutes";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ProfileImage } from "@/components/timeline/ProfileImage";
import { ImagePlusIcon } from "lucide-react";
import ChooseImageDialog from "./ChooseImageDialog";
import { BannerImage } from "@/components/timeline/BannerImage";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { socialHandlesList } from "@/utils/ui-utils";
import { addHttpsPrefix } from "@/utils/general";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EditTimelineTab } from "@/types/ui/dashboard";



const ProfileDisplayForm: FC = () => { 
  const { user, setUser } = useUser();
  const [submitting, setSubmitting] = useState(false);
  const [profileImage, setProfileImage] = useState(user?.profileImage);
  const [bannerImage, setBannerImage] = useState(user?.bannerImage);
  const [profileImageOpen, setProfileImageOpen] = useState(false);
  const [bannerImageOpen, setBannerImageOpen] = useState(false);

  useEffect(() => {
    if (user?.profileImage && !profileImage) setProfileImage(user.profileImage);
  }, [user?.profileImage, profileImage]);

  useEffect(() => {
    if (user?.bannerImage && !bannerImage) setBannerImage(user.bannerImage);
  }, [user?.bannerImage, bannerImage]);
  
  // Default values for the form populated from user data
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
    primaryTimeline: user?.primaryTimeline,
    // websites: user?.websites || [],
  };

  const form = useForm<ProfileDisplayFormValues>({
    resolver: zodResolver(profileDisplayFormSchema),
    defaultValues,
  });

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
    }
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
          location: "DisplayForm_onSubmit",
        });
        toast.error("Failed to update display information.");
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col space-y-6"
        >
          <div className="relative w-full h-fit">
            <Button
              type="button"
              variant={!!user?.bannerImage ? "outline" : "default"}
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
          <div className="w-full flex gap-6 flex-col sm:flex-row sm:items-center">
            <div className="relative size-16 sm:size-26 flex-shrink-0">
              <Button
                type="button"
                variant={!!user?.profileImage ? "outline" : "default"}
                size="icon"
                className="absolute top-0 right-0 z-10 "
                onClick={() => setProfileImageOpen(true)}
              >
                <ImagePlusIcon />
              </Button>
              <ProfileImage
                media={profileImage}
                fallbackText={
                  getDisplayName(user).charAt(0).toUpperCase() || "Z"
                }
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
                    <Input
                      placeholder={getDisplayName(user, true)}
                      {...field}
                    />
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

          <FormField
            control={form.control}
            name="primaryTimeline"
            render={({ field }) => (
              <FormItem className="mb-0">
                <FormLabel>Primary Timeline</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="">
                      <SelectValue placeholder="Primary Timeline" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={EditTimelineTab.ARTIST}>
                      Created
                    </SelectItem>
                    <SelectItem value={EditTimelineTab.COLLECTOR}>
                      Collected
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  The timeline that will be displayed first when viewing your
                  profile.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Accordion type="single" collapsible>
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

          <Separator />

          <Button type="submit" className="w-full" loading={submitting}>
            Save Display Information
          </Button>
        </form>
      </Form>
      <ChooseImageDialog
        imageVariant={"profile"}
        setSelectedMedia={setProfileImage}
        open={profileImageOpen}
        setOpen={setProfileImageOpen}
      />
      <ChooseImageDialog
        imageVariant={"banner"}
        setSelectedMedia={setBannerImage}
        open={bannerImageOpen}
        setOpen={setBannerImageOpen}
      />
    </>
  );
}

export default ProfileDisplayForm;