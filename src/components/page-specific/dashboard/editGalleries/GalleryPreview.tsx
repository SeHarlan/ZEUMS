import MediaThumbnail from "@/components/media/MediaThumbnail";
import { P } from "@/components/typography/Typography";
import EditEntryContextProvider from "@/context/EditEntryProvider";
import useGalleryById from "@/hooks/useGalleryById";
import { EntrySource } from "@/types/entry";
import { GalleryItemTypes } from "@/types/galleryItem";
import { FC } from "react";

interface GalleryPreviewProps {
  source: EntrySource;
  galleryId: string;
}

const GalleryPreview: FC<GalleryPreviewProps> = ({ galleryId }) => {
  const { gallery } = useGalleryById(galleryId);

  return (
    <EditEntryContextProvider>
      <div className="grid grid-cols-3 gap-4">
        {gallery?.items?.map((item) => (
          <div key={item._id.toString()}>
            <P>{item.title}</P>

            {item.itemType === GalleryItemTypes.BlockchainAsset && (
              <MediaThumbnail
                media={item.media}
              />
            )}

          </div>
        ))}

      </div>
    </EditEntryContextProvider>
  );
};

export default GalleryPreview;
