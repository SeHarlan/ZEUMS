import { isEyeDropperActiveAtom } from "@/atoms/eyeDropper";
import { TimelineOnboardingKeys, useTimelineSetter } from "@/atoms/onboarding/editTimeline";
import { BlockchainAssetEntryIcon } from "@/components/icons/EntryTypes";
import ImageUploadDialog from "@/components/media/ImageUploadDialog";
import MediaThumbnail from "@/components/media/MediaThumbnail";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { UploadCategory } from "@/constants/uploadCategories";
import { TimelineSettingsFormValues } from "@/forms/editTimelineSettings";
import { EntrySource } from "@/types/entry";
import { ImageType } from "@/types/media";
import { UserType } from "@/types/user";
import { useSetAtom } from "jotai";
import { Trash2Icon } from "lucide-react";
import { FC, useMemo, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import ChooseProfileImageDialog from "../../editProfile/ChooseImageDialog";

interface EditTimelineSettingsFormContentProps {
  user: UserType | null;
  form: UseFormReturn<TimelineSettingsFormValues>;
  backgroundImage: ImageType | null;
  setBackgroundImage: (image: ImageType | null) => void;
  onBackgroundFileSelect: (file: File) => void;
}

const EditTimelineSettingsFormContent: FC<EditTimelineSettingsFormContentProps> = ({
  user,
  form,
  backgroundImage,
  setBackgroundImage,
  onBackgroundFileSelect,
}) => {
  const { setStepRef: setPrimaryTimelineRef } = useTimelineSetter(
    TimelineOnboardingKeys.ChoosePrimaryTimeline
  );

  const setIsEyeDropperActive = useSetAtom(isEyeDropperActiveAtom);

  const [backgroundImageOpen, setBackgroundImageOpen] = useState(false);
  const [uploadBackgroundDialogOpen, setUploadBackgroundDialogOpen] =
    useState(false);


  const userId = user?._id?.toString();
  const backgroundBlobUrlBuilderProps = useMemo(() => {
    if (!userId) return undefined;
    return {
      userId,
      category: UploadCategory.PROFILE_BACKGROUND,
    };
  }, [userId]);

  const canUseEyeDropper =
    typeof window !== "undefined" &&
    typeof (window as unknown as { EyeDropper?: unknown }).EyeDropper !==
      "undefined";

  const handlePickTintFromScreen = async () => {
    if (!canUseEyeDropper) return;

    type EyeDropperResult = { sRGBHex: string };
    type EyeDropperInstance = { open: () => Promise<EyeDropperResult> };
    type EyeDropperConstructor = new () => EyeDropperInstance;

    const EyeDropperCtor = (
      window as unknown as { EyeDropper?: EyeDropperConstructor }
    ).EyeDropper;

    if (!EyeDropperCtor) return;

    try {
      setIsEyeDropperActive(true);
      const result = await new EyeDropperCtor().open();
      form.setValue("backgroundTintHex", result.sRGBHex, {
        shouldDirty: true,
        shouldValidate: true,
      });
    } catch (error) {
      // user cancel (AbortError) or unsupported behavior: ignore silently
      if (error instanceof Error && error.name === "AbortError") return;
    } finally {
      setIsEyeDropperActive(false);
    }
  };

  const showBlurControl = !!backgroundImage;

  return (
    <div className="flex flex-col space-y-6 py-4">
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
              description="Upload an image from your device to use as your timeline background"
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
        <FormDescription>
          This image will appear behind your entire timeline page.
        </FormDescription>

        <ChooseProfileImageDialog
          imageVariant={"banner"}
          setSelectedMedia={(media) => setBackgroundImage(media ?? null)}
          open={backgroundImageOpen}
          setOpen={setBackgroundImageOpen}
        />
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <FormLabel>Background Tint</FormLabel>
            {canUseEyeDropper && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePickTintFromScreen}
              >
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
                    />
                  </FormControl>

                  <FormControl>
                    <Input
                      type="color"
                      value={field.value}
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
                  {Math.round(field.value * 100)}%
                </span>
              </FormLabel>
              <FormControl>
                <Slider
                  min={0}
                  max={100}
                  value={[Math.round(field.value * 100)]}
                  onValueChange={(value) => field.onChange(value[0] / 100)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {showBlurControl && (
          <FormField
            control={form.control}
            name="backgroundBlur"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Image Blur{" "}
                  <span className="text-muted-foreground">{field.value}px</span>
                </FormLabel>
                <FormControl>
                  <Slider
                    min={0}
                    max={40}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>

      <FormField
        control={form.control}
        name="primaryTimeline"
        render={({ field }) => (
          <FormItem>
            <div className="grid gap-2" ref={setPrimaryTimelineRef}>
              <FormLabel>Primary Timeline</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Primary Timeline" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={EntrySource.Creator}>
                    <P>Created</P>
                  </SelectItem>
                  <SelectItem value={EntrySource.Collector}>
                    <P>Collected</P>
                  </SelectItem>
                </SelectContent>
              </Select>
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
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <FormMessage />
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
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default EditTimelineSettingsFormContent;

