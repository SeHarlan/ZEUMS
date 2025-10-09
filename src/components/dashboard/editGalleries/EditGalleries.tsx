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

  const buttonProps = galleries.length === 0 ? {
    buttonText: "Add New Gallery",
    buttonClassName: "h-40",
  } : {};

  return (
    <EditGallerySettingsContextProvider>
      <div className="space-y-6">
        <div className="sticky top-0 sm:top-8 rounded-xl p-6 z-20 shadow-md border bg-muted-blur mb-6">
          <CreateGalleryDialogButton source={source} {...buttonProps} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {galleries.map((gallery) => (
            <EditableGalleryCard
              key={gallery._id.toString()}
              gallery={gallery}
            />
          ))}
        </div>
      </div>
    </EditGallerySettingsContextProvider>
  );
}
export default EditGalleries;
