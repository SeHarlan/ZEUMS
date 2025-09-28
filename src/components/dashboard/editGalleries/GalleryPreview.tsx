import useGalleryById from "@/hooks/useGalleryById";
import { EntrySource } from "@/types/entry";
import { FC } from "react";
import EditableItem from "../editGalleryItems/EditableItem";
import EditGalleryItemContextProvider from "@/context/EditGalleryItemProvider";

interface GalleryPreviewProps {
  source: EntrySource;
  galleryId: string;
}

const GalleryPreview: FC<GalleryPreviewProps> = ({ galleryId }) => {
  const { gallery } = useGalleryById(galleryId);

  return (
    <EditGalleryItemContextProvider>
      <div className="grid grid-cols-4 gap-4">
        {gallery?.items?.map((item) => (
          <EditableItem key={item._id.toString()} item={item} />
        ))}
      </div>
    </EditGalleryItemContextProvider>
  );
};

export default GalleryPreview;
