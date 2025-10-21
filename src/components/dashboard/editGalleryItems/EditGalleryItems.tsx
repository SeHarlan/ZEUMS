import GalleryBase from "@/components/gallery/GalleryBase";
import useGalleryById from "@/hooks/useGalleryById";
import { FC } from "react";
import EditableItem from "./EditableItem";
import { EditGalleryBar } from "./EditGalleryBar";
import NewItemFormButton from "./newItemForm/NewItemForm";

interface EditGalleryItemsProps {
  galleryId: string;
}

const EditGalleryItems: FC<EditGalleryItemsProps> = ({ galleryId }) => { 
  const { gallery, isLoading } = useGalleryById(galleryId);

  const isReady = !isLoading && !!gallery;

  return (
    <div className="">
      <EditGalleryBar galleryId={galleryId} />
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