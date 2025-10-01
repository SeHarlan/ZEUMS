import NewItemFormButton from "./newItemForm/NewItemForm";
import { GalleryType } from "@/types/gallery";
import { FC } from "react";
import { KeyedMutator } from "swr";
import AddBlockchainGalleryItemsButton from "./AddBlockchainGalleryItems";
import GalleryBase from "@/components/gallery/GalleryBase";
import EditableItem from "./EditableItem";
import { Button } from "@/components/ui/button";
import { P } from "@/components/typography/Typography";
import { SettingsIcon } from "lucide-react";
import { convertToUserVirtualGallery } from "@/utils/gallery";
import { useEditGallerySettings } from "@/context/EditGallerySettingsProvider";
import RearrangeItemsButton from "./rearrangeItems/RearrangeItems";

interface EditGalleryItemsProps {
  gallery: GalleryType;
  mutateGallery: KeyedMutator<GalleryType | null>;
}

const EditGalleryItems: FC<EditGalleryItemsProps> = ({ gallery, mutateGallery }) => { 
  const { openEditDrawer } = useEditGallerySettings();
  const handleOpenEditDrawer = () => {
    if (gallery) {
      openEditDrawer(convertToUserVirtualGallery(gallery));
    }
  };
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-[1fr_auto] md:grid-cols-[2fr_1fr] gap-6">
        <NewItemFormButton gallery={gallery} mutateGallery={mutateGallery} />
        <Button
          onClick={handleOpenEditDrawer}
          disabled={!gallery}
          variant={"outline"}
          className="w-full"
        >
          <P className="hidden md:block">Edit Gallery Settings</P>
          <SettingsIcon />
        </Button>
      </div>
      <div className="grid grid-cols-[auto_1fr] md:grid-cols-[1fr_2fr] gap-6 mb-8">
        <AddBlockchainGalleryItemsButton
          gallery={gallery}
          mutateGallery={mutateGallery}
        />
        <RearrangeItemsButton gallery={gallery} mutateGallery={mutateGallery} />
      </div>
      <GalleryBase
        gallery={gallery}
        ItemComponent={EditableItem}
        hideItemDescriptions={gallery.hideItemDescriptions}
        hideItemTitles={gallery.hideItemTitles}
      />
    </div>
  );
}

export default EditGalleryItems;