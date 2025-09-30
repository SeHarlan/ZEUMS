"use client";

import { useUser } from "@/context/UserProvider";
import { EntrySource } from "@/types/entry";
import { FC } from "react";
import CreateGalleryDialogButton from "./CreateGalleryDialog";
import EditGallerySettingsContextProvider from "@/context/EditGallerySettingsProvider";
import EditableGalleryCard from "./EditableGalleryCard";

interface EditGalleriesProps {
  source: EntrySource;
}
const EditGalleries: FC<EditGalleriesProps> = ({ source }) => { 
  const { user } = useUser();

  const galleriesMap = {
    [EntrySource.Creator]: user?.createdGalleries,
    [EntrySource.Collector]: user?.collectedGalleries,
  };

  const galleries = (galleriesMap[source] || [])

  return (
    <EditGallerySettingsContextProvider>
      <div className="space-y-6">
        <CreateGalleryDialogButton source={source} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {galleries.map((gallery) => (
            <EditableGalleryCard key={gallery._id.toString()} gallery={gallery} />
          ))}
        </div>
      </div>
    </EditGallerySettingsContextProvider>
  );
}
export default EditGalleries;
