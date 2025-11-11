"use client";

import { editTimelineSourceAtom } from "@/atoms/dashboard";
import EditGallerySettingsContextProvider from "@/context/EditGallerySettingsProvider";
import { useUser } from "@/context/UserProvider";
import { EntrySource } from "@/types/entry";
import { useAtomValue } from "jotai/react";
import { FC } from "react";
import CreateGalleryDialogButton from "./CreateGalleryDialog";
import EditableGalleryCard from "./EditableGalleryCard";
import { EditGalleriesBar } from "./EditGalleriesBar";


const EditGalleries: FC = () => { 
  const { user } = useUser();
  const source = useAtomValue(editTimelineSourceAtom);

  const galleriesMap = {
    [EntrySource.Creator]: user?.createdGalleries,
    [EntrySource.Collector]: user?.collectedGalleries,
  };

  const galleries = (galleriesMap[source] || [])


  return (
    <EditGallerySettingsContextProvider>
      <EditGalleriesBar />
      <div className="space-y-6">
        {galleries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {galleries.map((gallery) => (
              <EditableGalleryCard
                key={gallery._id.toString()}
                gallery={gallery}
              />
            ))}
          </div>
        ) : (
          <CreateGalleryDialogButton
            source={source}
            buttonClassName="h-40"
            buttonVariant="outline"
          />
        )}
      </div>
    </EditGallerySettingsContextProvider>
  );
}
export default EditGalleries;
