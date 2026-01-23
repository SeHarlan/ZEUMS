import { BannerImage } from "@/components/timeline/BannerImage";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { UploadCategory } from "@/constants/uploadCategories";
import { useUser } from "@/context/UserProvider";
import { UpsertGalleryFormValues } from "@/forms/upsertGallery";
import { ImageType } from "@/types/media";
import { ImagePlusIcon, Trash2Icon } from "lucide-react";
import { FC, useMemo, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import ChooseProfileImageDialog from "../../editProfile/ChooseImageDialog";

interface EditSettingsContentProps { 
  form: UseFormReturn<UpsertGalleryFormValues>;
  bannerImage?: ImageType | null;
  setBannerImage: (image?: ImageType | null) => void;
}

const EditSettingsContent: FC<EditSettingsContentProps> = ({ form, bannerImage, setBannerImage }) => { 
  const [bannerImageOpen, setBannerImageOpen] = useState(false);
  const {user} = useUser();
  // Create blobUrlBuilderProps using the gallery owner's ID
  const galleryOwnerId = user?._id?.toString();
  const bannerBlobUrlBuilderProps = useMemo(() => {
    if (!galleryOwnerId) return undefined;
    return {
      userId: galleryOwnerId,
      category: UploadCategory.GALLERY_BANNER,
    };
  }, [galleryOwnerId]);

  return (
    <div className="h-fit space-y-6">
      <div className="relative w-full h-fit">
        <div className="absolute -top-2 -right-2 z-10 flex gap-2">
          {bannerImage && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() => setBannerImage(null)}
            >
              <Trash2Icon />
            </Button>
          )}
          <Button
            type="button"
            variant={bannerImage ? "outline" : "default"}
            size="icon"
            onClick={() => setBannerImageOpen(true)}
          >
            <ImagePlusIcon />
          </Button>
        </div>
        <BannerImage
          media={bannerImage || undefined}
          className="text-5xl"
          fallbackText={"Banner Image"}
          blobUrlBuilderProps={bannerBlobUrlBuilderProps}
        />
      </div>


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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter gallery description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="hideItemTitles"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hide Item Titles</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="hideItemDescriptions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hide Item Descriptions</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />


      <ChooseProfileImageDialog
        imageVariant={"banner"}
        setSelectedMedia={setBannerImage}
        open={bannerImageOpen}
        setOpen={setBannerImageOpen}
      />
    </div>
  );
}
export default EditSettingsContent