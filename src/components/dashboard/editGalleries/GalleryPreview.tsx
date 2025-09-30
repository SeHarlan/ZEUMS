import { FC } from "react";
import EditableItem from "../editGalleryItems/EditableItem";
import EditGalleryItemContextProvider from "@/context/EditGalleryItemProvider";
import { GalleryType } from "@/types/gallery";
import GalleryBase from "@/components/gallery/GalleryBase";

interface GalleryPreviewProps {
  gallery: GalleryType;
}

const GalleryPreview: FC<GalleryPreviewProps> = ({ gallery }) => {

  return (
    <EditGalleryItemContextProvider>
      <GalleryBase gallery={gallery} ItemComponent={EditableItem} />
    </EditGalleryItemContextProvider>
  );
};

export default GalleryPreview;
