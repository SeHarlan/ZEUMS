import GalleryBase from "@/components/gallery/GalleryBase";
import { PAGE_PADDING_X } from "@/components/general/PageContainer";
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
        <div className={PAGE_PADDING_X}>
          <NewItemFormButton
            galleryId={galleryId}
            buttonVariant="outline"
            buttonClassName="h-40"
            buttonText="Create First Gallery Item"
          />
        </div>
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