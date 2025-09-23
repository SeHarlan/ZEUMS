"use client";

import { useUser } from "@/context/UserProvider";
import { EntrySource } from "@/types/entry";
import { FC } from "react";
import CreateGalleryDialog from "./CreateGalleryDialog";

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
    <div>
      <CreateGalleryDialog  />
      {galleries.map(gallery => (
        <div key={gallery._id.toString()}>
          <p className="text-lg font-bold">{gallery.title}</p>
          <p>{gallery.description}</p>
        </div>
      ))}
    </div>
  );
}
export default EditGalleries;
