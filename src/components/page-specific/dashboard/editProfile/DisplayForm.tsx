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
import { getDisplayName } from "@/utils/user";
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
      // tiktok: user?.socialHandles?.tiktok || "",
      // facebook: user?.socialHandles?.facebook || "",
      // telegram: user?.socialHandles?.telegram || "",
      // discord: user?.socialHandles?.discord || "",
    },
    // websites: user?.websites || [],
  };

  const form = useForm<ProfileDisplayFormValues>({
    resolver: zodResolver(profileDisplayFormSchema),
    defaultValues,
  });

  const onSubmit = (data: ProfileDisplayFormValues) => {
    setSubmitting(true);

    const userData: Partial<UserType> = {
      ...data,
      profileImage,
      bannerImage,
    }
    axios
      .patch<{ user: UserType }>(USER_ROUTE, userData)
      .then((response) => {
        toast.success("Display information updated successfully!");
        setUser(response.data.user);
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
            <div className="relative size-20 sm:size-36 flex-shrink-0">
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
                fallbackText={getDisplayName(user).charAt(0) || "Z"}
                className="text-2xl sm:text-5xl border-3"
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
                  <Textarea placeholder="Tell us about yourself" {...field} />
                </FormControl>
                <FormDescription>Briefly describe yourself</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Social Links</h3>

            <FormField
              control={form.control}
              name="socialHandles.x"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>X (Twitter)</FormLabel>
                  <FormControl>
                    <PrefixInput
                      prefix="x.com/"
                      placeholder="username"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="socialHandles.instagram"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instagram</FormLabel>
                  <FormControl>
                    <PrefixInput
                      prefix="instagram.com/"
                      placeholder="username"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* <FormField
            control={form.control}
            name="socialHandles.tiktok"
            render={({ field }) => (
              <FormItem>
                <FormLabel>TikTok</FormLabel>
                <FormControl>
                  <PrefixInput
                    prefix="tiktok.com/@"
                    placeholder="username"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          /> */}
          </div>

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