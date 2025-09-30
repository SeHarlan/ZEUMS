import GalleryPreview from "../editGalleries/GalleryPreview";
import NewItemForm from "./newItemForm/NewItemForm";
import { GalleryType } from "@/types/gallery";
import { FC } from "react";
import { KeyedMutator } from "swr";
import AddBlockchainGalleryItems from "./AddBlockchainGalleryItems";

interface EditGalleryItemsProps {
  gallery: GalleryType;
  mutateGallery: KeyedMutator<GalleryType | null>;
}

const EditGalleryItems: FC<EditGalleryItemsProps> = ({ gallery, mutateGallery }) => { 
  return (
    <div className="space-y-6">
      <NewItemForm gallery={gallery} mutateGallery={mutateGallery} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <AddBlockchainGalleryItems gallery={gallery} mutateGallery={mutateGallery} />
      </div>
      <GalleryPreview gallery={gallery} />
    </div>  
  );
}

export default EditGalleryItems;