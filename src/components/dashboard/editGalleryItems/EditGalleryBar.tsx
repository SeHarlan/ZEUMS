import { P } from "@/components/typography/Typography";
import { Button } from "@/components/ui/button";
import { useEditGallerySettings } from "@/context/EditGallerySettingsProvider";
import useGalleryById from "@/hooks/useGalleryById";
import { convertToUserVirtualGallery } from "@/utils/gallery";
import { Minimize2Icon, SettingsIcon } from "lucide-react";
import { FC, useState } from "react";
import { EditBar } from "../EditBar";
import AddBlockchainGalleryItemsButton from "./AddBlockchainGalleryItems";
import NewItemFormButton from "./newItemForm/NewItemForm";
import RearrangeItemsButton from "./rearrangeItems/RearrangeItems";


interface EditGalleryBarProps {
  fixed?: boolean;
  galleryId: string;
}

export const EditGalleryBar: FC<EditGalleryBarProps> = ({ fixed = true, galleryId }) => { 
  const { gallery, isLoading } = useGalleryById(galleryId);
  const { openEditDrawer } = useEditGallerySettings();
  const isReady = !isLoading && !!gallery;

  const [isOpen, setIsOpen] = useState(true);
  const handleOpenEditDrawer = () => {
    if (gallery) {
      openEditDrawer(convertToUserVirtualGallery(gallery));
    }
  };
  return (
    <EditBar fixed={fixed} isOpen={isOpen} setIsOpen={setIsOpen}>
      <div className="grid grid-cols-[1fr_auto] md:grid-cols-[2fr_1fr] gap-6 mb-6">
        <NewItemFormButton galleryId={galleryId} />
        <Button
          onClick={handleOpenEditDrawer}
          disabled={!gallery}
          variant={"outline"}
          className="w-full"
        >
          <P className="hidden md:block">Edit Gallery Settings</P>
          <SettingsIcon />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="justify-self-end p-0 h-auto"
        >
          <Minimize2Icon />
        </Button>
      </div>
      <div className="grid grid-cols-[auto_1fr] md:grid-cols-[1fr_2fr] gap-6">
        <AddBlockchainGalleryItemsButton galleryId={galleryId} />
        <RearrangeItemsButton galleryId={galleryId} />
      </div>
    </EditBar>
  );
}