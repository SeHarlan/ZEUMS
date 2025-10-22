"use client";

import { GalleryEntryIcon } from "@/components/icons/EntryTypes";
import { P } from "@/components/typography/Typography";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EDIT_GALLERY } from "@/constants/clientRoutes";
import { GALLERY_ROUTE } from "@/constants/serverRoutes";
import { useUser } from "@/context/UserProvider";
import { upsertGalleryFormSchema, UpsertGalleryFormValues } from "@/forms/upsertGallery";
import { EntrySource } from "@/types/entry";
import { BaseGalleryType } from "@/types/gallery";
import { getGalleryKey } from "@/utils/gallery";
import { handleClientError } from "@/utils/handleError";
import { cn } from "@/utils/ui-utils";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import { FC, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface CreateGalleryDialogProps {
  source: EntrySource;
  buttonClassName?: string;
  buttonVariant?: "default" | "outline" | "ghost" | "link";
}
const CreateGalleryDialogButton: FC<CreateGalleryDialogProps> = ({ source, buttonClassName, buttonVariant = "default" }) => {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { setUser } = useUser();
  const router = useRouter();

  const galleryKey = getGalleryKey(source);

  const sourceText = source.charAt(0).toUpperCase() + source.slice(1);
  const buttonText = `Create New ${sourceText} Gallery`;
  
  const form = useForm<UpsertGalleryFormValues>({
    resolver: zodResolver(upsertGalleryFormSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const onSubmit = (data: UpsertGalleryFormValues) => {
    setSubmitting(true);

    const createGalleryData = {
      ...data,
      source: source,
    };

    axios
      .post<{ newGallery: BaseGalleryType }>(GALLERY_ROUTE, createGalleryData)
      .then((response) => {
        const { newGallery } = response.data;
        
        toast.success("Gallery created successfully!");
        // Update user context with new gallery
        setUser((prevUser) => {
          if (!prevUser) return prevUser;
          const prevGalleries = prevUser[galleryKey] || [];
          return {
            ...prevUser,
            [galleryKey]: [...prevGalleries, newGallery],
          };
        });
        // Reset form and close dialog
        form.reset();
        setOpen(false);
        
        router.push(EDIT_GALLERY(newGallery._id.toString()));
      })
      .catch((error) => {
        toast.error("Failed to create gallery.");
        handleClientError({
          error,
          location: "CreateGalleryDialog_onSubmit",
        });
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!submitting) {
      setOpen(newOpen);
      if (!newOpen) {
        form.reset();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg" className={cn("w-full", buttonClassName)} variant={buttonVariant}>
          <P>{buttonText}</P>
          <GalleryEntryIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Gallery</DialogTitle>
          <DialogDescription>
            Create a focused collection that showcases your content in detail.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter gallery title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter gallery description"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" loading={submitting} disabled={submitting}>
                Create Gallery
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGalleryDialogButton;
