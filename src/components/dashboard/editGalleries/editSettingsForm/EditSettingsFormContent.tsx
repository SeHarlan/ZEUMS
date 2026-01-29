import { isEyeDropperActiveAtom } from "@/atoms/eyeDropper";
import { BlockchainAssetEntryIcon } from "@/components/icons/EntryTypes";
import ImageUploadDialog from "@/components/media/ImageUploadDialog";
import MediaThumbnail from "@/components/media/MediaThumbnail";
import { BannerImage } from "@/components/timeline/BannerImage";
import { P } from "@/components/typography/Typography";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { UploadCategory } from "@/constants/uploadCategories";
import { useUser } from "@/context/UserProvider";
import { UpsertGalleryFormValues } from "@/forms/upsertGallery";
import { ImageType } from "@/types/media";
import { UserType } from "@/types/user";
import { useSetAtom } from "jotai";
import { ImagePlusIcon, Trash2Icon } from "lucide-react";
import { FC, useMemo, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import ChooseProfileImageDialog from "../../editProfile/ChooseImageDialog";

interface EditSettingsContentProps {
  form: UseFormReturn<UpsertGalleryFormValues>;
  bannerImage?: ImageType | null;
  setBannerImage: (image?: ImageType | null) => void;
  user: UserType | null;
  backgroundImage: ImageType | null;
  setBackgroundImage: (image: ImageType | null) => void;
  onBackgroundFileSelect: (file: File) => void;
}

const EditSettingsContent: FC<EditSettingsContentProps> = ({
  form,
  bannerImage,
  setBannerImage,
  user,
  backgroundImage,
  setBackgroundImage,
  onBackgroundFileSelect,
}) => {
  const [bannerImageOpen, setBannerImageOpen] = useState(false);
  const [backgroundImageOpen, setBackgroundImageOpen] = useState(false);
  const [uploadBackgroundDialogOpen, setUploadBackgroundDialogOpen] = useState(false);
  const { user: contextUser } = useUser();
  const galleryOwnerId = (user ?? contextUser)?._id?.toString();
  const bannerBlobUrlBuilderProps = useMemo(() => {
    if (!galleryOwnerId) return undefined;
    return { userId: galleryOwnerId, category: UploadCategory.GALLERY_BANNER };
  }, [galleryOwnerId]);
  const backgroundBlobUrlBuilderProps = useMemo(() => {
    if (!galleryOwnerId) return undefined;
    return { userId: galleryOwnerId, category: UploadCategory.GALLERY_BACKGROUND };
  }, [galleryOwnerId]);
  const setIsEyeDropperActive = useSetAtom(isEyeDropperActiveAtom);
  const canUseEyeDropper =
    typeof window !== "undefined" &&
    typeof (window as unknown as { EyeDropper?: unknown }).EyeDropper !== "undefined";
  const handlePickTintFromScreen = async () => {
    if (!canUseEyeDropper) return;
    type EyeDropperResult = { sRGBHex: string };
    type EyeDropperInstance = { open: () => Promise<EyeDropperResult> };
    type EyeDropperConstructor = new () => EyeDropperInstance;
    const EyeDropperCtor = (window as unknown as { EyeDropper?: EyeDropperConstructor }).EyeDropper;
    if (!EyeDropperCtor) return;
    try {
      setIsEyeDropperActive(true);
      const result = await new EyeDropperCtor().open();
      form.setValue("backgroundTintHex", result.sRGBHex ?? "#000000", {
        shouldDirty: true,
        shouldValidate: true,
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
    } finally {
      setIsEyeDropperActive(false);
    }
  };
  const useCustomBackgroundSettings = form.watch("useCustomBackgroundSettings");
  const showBlurControl = !!backgroundImage;

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

      <Separator className="my-6" />

      <FormField
        control={form.control}
        name="useCustomBackgroundSettings"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-md border border-input p-4">
            <div className="space-y-0.5">
              <FormLabel>Use custom background & theme</FormLabel>
              <FormDescription>
                When off, this gallery page uses your timeline&apos;s background and theme. When on, it uses the settings below. Toggling does not change the saved values.
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value ?? false}
                onCheckedChange={field.onChange}
                aria-label="Use custom background and theme"
              />
            </FormControl>
          </FormItem>
        )}
      />

      {useCustomBackgroundSettings && (
        <>
          <FormField
            control={form.control}
            name="galleryTheme"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-md border border-input p-4">
                <div className="space-y-0.5">
                  <FormLabel>Dark mode</FormLabel>
                  <FormDescription>Change this gallery&apos;s theme.</FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={(field.value ?? "light") === "dark"}
                    onCheckedChange={(checked) => field.onChange(checked ? "dark" : "light")}
                    aria-label="Dark mode for gallery"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <FormLabel>Background Tint</FormLabel>
              {canUseEyeDropper && (
                <Button type="button" variant="outline" size="sm" onClick={handlePickTintFromScreen}>
                  <P>Pick from screen</P>
                </Button>
              )}
            </div>
            <FormField
              control={form.control}
              name="backgroundTintHex"
              render={({ field }) => (
                <FormItem>
                  <div className="grid grid-cols-[1fr_auto] gap-3 items-center">
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="#000000"
                        autoComplete="off"
                        {...field}
                        value={field.value ?? "#000000"}
                      />
                    </FormControl>
                    <FormControl>
                      <Input
                        type="color"
                        value={field.value ?? "#000000"}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="h-9 w-12 p-1"
                        aria-label="Background tint color"
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="backgroundTintOpacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Tint Opacity{" "}
                  <span className="text-muted-foreground">
                    {Math.round((field.value ?? 0.35) * 100)}%
                  </span>
                </FormLabel>
                <FormControl>
                  <Slider
                    min={0}
                    max={100}
                    value={[Math.round((field.value ?? 0.35) * 100)]}
                    onValueChange={(value) => field.onChange(value[0] / 100)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="space-y-2">
            <FormLabel>Background Image</FormLabel>
            <div className="relative w-full h-fit">
              <div className="absolute -top-2 -right-2 z-10 flex gap-2">
                {backgroundImage && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => setBackgroundImage(null)}
                  >
                    <Trash2Icon />
                  </Button>
                )}
                <ImageUploadDialog
                  title="Upload Background Image"
                  description="Upload an image from your device to use as this gallery's background"
                  onSelect={onBackgroundFileSelect}
                  open={uploadBackgroundDialogOpen}
                  onOpenChange={setUploadBackgroundDialogOpen}
                />
                <Button
                  type="button"
                  variant={backgroundImage ? "outline" : "default"}
                  size="icon"
                  onClick={() => setBackgroundImageOpen(true)}
                >
                  <BlockchainAssetEntryIcon />
                </Button>
              </div>
              {backgroundImage ? (
                <MediaThumbnail
                  media={backgroundImage}
                  objectFit="object-cover"
                  ratio={16 / 9}
                  className="text-5xl"
                  blobUrlBuilderProps={backgroundBlobUrlBuilderProps}
                />
              ) : (
                <AspectRatio
                  ratio={16 / 9}
                  className="flex items-center justify-center rounded-md bg-muted text-muted-foreground"
                >
                  <P>Background Image</P>
                </AspectRatio>
              )}
            </div>
            <FormDescription>This image will appear behind this gallery page.</FormDescription>
            <ChooseProfileImageDialog
              imageVariant="default"
              setSelectedMedia={(media) => setBackgroundImage(media ?? null)}
              open={backgroundImageOpen}
              setOpen={setBackgroundImageOpen}
            />
          </div>
          {showBlurControl && (
            <>
              <FormField
                control={form.control}
                name="backgroundBlur"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Image Blur{" "}
                      <span className="text-muted-foreground">{field.value ?? 0}px</span>
                    </FormLabel>
                    <FormControl>
                      <Slider
                        min={0}
                        max={40}
                        value={[field.value ?? 0]}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="backgroundTileCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tile Count</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        placeholder="0"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={(e) => {
                          const value = e.target.value;
                          field.onChange(value === "" ? "0" : value);
                          field.onBlur();
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Number of rows to tile the background image (0 = no tiling)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </>
      )}

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