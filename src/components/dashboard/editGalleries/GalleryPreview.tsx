import { FC } from "react";
import EditableItem from "../editGalleryItems/EditableItem";
import EditGalleryItemContextProvider from "@/context/EditGalleryItemProvider";
import { GalleryType } from "@/types/gallery";

interface GalleryPreviewProps {
  gallery: GalleryType;
}

const GalleryPreview: FC<GalleryPreviewProps> = ({ gallery }) => {
        console.log("🚀 ~ GalleryPreview ~ gallery.items:", gallery.items)
  return (
    <EditGalleryItemContextProvider>
      <div className="grid grid-cols-4 gap-4">
        {gallery.items?.map((item) => (
          <EditableItem key={item._id.toString()} item={item} />
        ))}
      </div>
    </EditGalleryItemContextProvider>
  );
};

export default GalleryPreview;
