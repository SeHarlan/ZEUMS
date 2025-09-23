"use client";

import { FC, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createGalleryFormSchema, CreateGalleryFormValues } from "@/forms/createGallery";
import { P } from "@/components/typography/Typography";
import { SquarePlusIcon } from "lucide-react";
import { useUser } from "@/context/UserProvider";
import axios from "axios";
import { toast } from "sonner";
import { handleClientError } from "@/utils/handleError";
import { GALLERY_ROUTE } from "@/constants/serverRoutes";
import { GalleryType } from "@/types/gallery";

const CreateGalleryDialog: FC = () => {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { setUser } = useUser();

  const form = useForm<CreateGalleryFormValues>({
    resolver: zodResolver(createGalleryFormSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const onSubmit = (data: CreateGalleryFormValues) => {
    setSubmitting(true);

    axios
      .post<{ createdGallery: GalleryType }>(GALLERY_ROUTE, data)
      .then((response) => {
        const { createdGallery } = response.data;
        
        toast.success("Gallery created successfully!");
        
        // Update user context with new gallery
        setUser(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            createdGalleries: [...(prev.createdGalleries || []), createdGallery]
          };
        });

        // Reset form and close dialog
        form.reset();
        setOpen(false);
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
        <Button className="w-full">
          <P>Create New Gallery</P>
          <SquarePlusIcon />
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

export default CreateGalleryDialog;
