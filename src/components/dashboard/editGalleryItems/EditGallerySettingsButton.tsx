import { P } from "@/components/typography/Typography";
import { Button } from "@/components/ui/button";
import { useEditGallerySettings } from "@/context/EditGallerySettingsProvider";
import { GalleryType } from "@/types/gallery";
import { convertToUserVirtualGallery } from "@/utils/gallery";
import { SettingsIcon } from "lucide-react";
import { FC } from "react";

interface EditGallerySettingsButtonProps {
  gallery?: GalleryType | null;
  buttonClassName?: string;
  buttonVariant?: "default" | "outline" | "ghost" | "link";
}
export const EditGallerySettingsButton: FC<EditGallerySettingsButtonProps> = ({ gallery, buttonClassName, buttonVariant = "outline" }) => { 
  const { openEditDrawer } = useEditGallerySettings(); 
  const handleOpenEditDrawer = () => {
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
    >
      <P>Edit Settings</P>
      <SettingsIcon className="hidden md:block" />
    </Button>
  );
}