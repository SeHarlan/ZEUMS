import { FC, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Loader2 } from "lucide-react";
import { GalleryDisplayTypes } from "@/types/gallery";
import { cn } from "@/utils/ui-utils";

const galleryFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  displayType: z.nativeEnum(GalleryDisplayTypes).default(GalleryDisplayTypes.Grid),
});

type GalleryFormData = z.infer<typeof galleryFormSchema>;

interface GalleryFormProps {
  initialData?: Partial<GalleryFormData>;
  onSubmit: (data: GalleryFormData) => void;
  isSubmitting?: boolean;
  className?: string;
}

const GalleryForm: FC<GalleryFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting = false,
  className,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
    reset,
  } = useForm<GalleryFormData>({
    resolver: zodResolver(galleryFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      displayType: initialData?.displayType || GalleryDisplayTypes.Grid,
    },
  });

  const watchedDisplayType = watch("displayType");

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title || "",
        description: initialData.description || "",
        displayType: initialData.displayType || GalleryDisplayTypes.Grid,
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = (data: GalleryFormData) => {
    onSubmit(data);
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Save className="size-5" />
          Gallery Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Title Field */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Enter gallery title..."
              className={cn(errors.title && "border-destructive")}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Enter gallery description..."
              rows={3}
              className={cn(errors.description && "border-destructive")}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {watch("description")?.length || 0}/500 characters
            </p>
          </div>

          {/* Display Type Field */}
          <div className="space-y-2">
            <Label htmlFor="displayType">Display Type</Label>
            <Select
              value={watchedDisplayType}
              onValueChange={(value) => setValue("displayType", value as GalleryDisplayTypes)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select display type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={GalleryDisplayTypes.Grid}>
                  Grid Layout
                </SelectItem>
                {/* Add more display types as they become available */}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose how your gallery items will be displayed
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={!isDirty || isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="size-4 mr-2" />
                  Save Gallery
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default GalleryForm;