"use client";
import { FC, useState } from "react";
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
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

const ProfileDisplayForm: FC = () => { 
  const { user, setUser } = useUser();
  const [submitting, setSubmitting] = useState(false);


  // Default values for the form populated from user data
  const defaultValues: Partial<ProfileDisplayFormValues> = {
    // profilePicture: user?.profilePicture,
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
    axios
      .patch<{ user: UserType }>(USER_ROUTE, data)
      .then((response) => {
        // Update the user context with the returned user data
        if (response.data.user) {
          setUser(response.data.user);
        }

        toast.success("Display information updated successfully!");
        // Optionally, you can update the user context or show a success message
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
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col space-y-6"
      >
        <div className="w-full flex gap-6 flex-col sm:flex-row">
          {/* <Avatar className="w-24 h-24">
            <AvatarImage src={form.watch("profilePicture")} />
            <AvatarFallback className="text-4xl font-serif">
              {form.watch("displayName")?.charAt(0) || "Z"}
            </AvatarFallback>
          </Avatar> */}

          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem className="w-full">
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
  );
}

export default ProfileDisplayForm;