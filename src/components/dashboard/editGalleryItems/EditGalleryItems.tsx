import NewItemFormButton from "./newItemForm/NewItemForm";
import { FC } from "react";
import AddBlockchainGalleryItemsButton from "./AddBlockchainGalleryItems";
import GalleryBase from "@/components/gallery/GalleryBase";
import EditableItem from "./EditableItem";
import { Button } from "@/components/ui/button";
import { P } from "@/components/typography/Typography";
import { SettingsIcon } from "lucide-react";
import { convertToUserVirtualGallery } from "@/utils/gallery";
import { useEditGallerySettings } from "@/context/EditGallerySettingsProvider";
import RearrangeItemsButton from "./rearrangeItems/RearrangeItems";
import useGalleryById from "@/hooks/useGalleryById";

interface EditGalleryItemsProps {
  galleryId: string;
}

const EditGalleryItems: FC<EditGalleryItemsProps> = ({ galleryId }) => { 
  const { gallery, isLoading } = useGalleryById(galleryId);

  const isReady = !isLoading && !!gallery;

  const { openEditDrawer } = useEditGallerySettings();
  const handleOpenEditDrawer = () => {
    if (gallery) {
      openEditDrawer(convertToUserVirtualGallery(gallery));
    }
  };
  return (
    <div className="">
      <div className="sticky top-0 sm:top-8 rounded-xl p-6 z-20 shadow-md border bg-muted-blur mb-6">
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
        </div>
        <div className="grid grid-cols-[auto_1fr] md:grid-cols-[1fr_2fr] gap-6">
          <AddBlockchainGalleryItemsButton galleryId={galleryId} />
          <RearrangeItemsButton galleryId={galleryId} />
        </div>
      </div>

      {isReady && !gallery?.items?.length ? (
        <NewItemFormButton
          galleryId={galleryId}
          buttonVariant="outline"
          buttonClassName="h-40"
          buttonText="Create First Gallery Item"
        />
      ) : (
        <GalleryBase
          gallery={gallery}
          ItemComponent={EditableItem}
          hideItemDescriptions={gallery?.hideItemDescriptions}
          hideItemTitles={gallery?.hideItemTitles}
        />
      )}
    </div>
  );
}

export default EditGalleryItems;