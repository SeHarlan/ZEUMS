import { P } from "@/components/typography/Typography";
import { Button } from "@/components/ui/button";
import { useEditGallerySettings } from "@/context/EditGallerySettingsProvider";
import { GalleryType } from "@/types/gallery";
import { convertToUserVirtualGallery } from "@/utils/gallery";
import { SettingsIcon } from "lucide-react";
import { forwardRef } from "react";

interface EditGallerySettingsButtonProps {
  gallery?: GalleryType | null;
  buttonClassName?: string;
  buttonVariant?: "default" | "outline" | "ghost" | "link";
  onClick?: () => void;
}
export const EditGallerySettingsButton = forwardRef<
  HTMLButtonElement,
  EditGallerySettingsButtonProps
>(({ gallery, buttonClassName, buttonVariant = "outline", onClick }, ref) => {
  const { openEditDrawer } = useEditGallerySettings();
  const handleOpenEditDrawer = () => {
    onClick?.();
    if (gallery) {
      openEditDrawer(convertToUserVirtualGallery(gallery));
    }
  };
  return (
    <Button
      onClick={handleOpenEditDrawer}
      disabled={!gallery}
      variant={buttonVariant}
      className={buttonClassName}
      ref={ref}
    >
      <P>Edit Settings</P>
      <SettingsIcon className="hidden md:block" />
    </Button>
  );
});
