import MediaThumbnail from "@/components/media/MediaThumbnail";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserProvider";
import { EntrySource } from "@/types/entry";
import { UserVirtualGalleryType } from "@/types/gallery";
import { getGalleryKey } from "@/utils/gallery";
import { cn } from "@/utils/ui-utils";
import { TrashIcon } from "lucide-react";
import { FC, useState } from "react";
import { P } from "../typography/Typography";
import CreateGalleryDialogButton from "./editGalleries/CreateGalleryDialog";

interface SelectGalleryEntryProps {
  source: EntrySource;
  entryGallery: UserVirtualGalleryType | null;
  setEntryGallery: (gallery: UserVirtualGalleryType | null) => void;
}

const SelectGalleryEntry: FC<SelectGalleryEntryProps> = ({
  entryGallery,
  setEntryGallery,
  source,
}) => {
  const [selectedGallery, setSelectedGallery] = useState<UserVirtualGalleryType | null>(null);
  const { user } = useUser();
  const galleryKey = getGalleryKey(source);
  const galleries = user?.[galleryKey] || [];

  const noGalleries = galleries.length === 0;
  const handleRemoveGallery = () => {
    setEntryGallery(null);
    setSelectedGallery(null);
  };

  if (entryGallery === null) {
    return (
      <div className="flex flex-col gap-4 items-start">
        {galleries?.map((gallery) => (
          <GalleryCard
            key={gallery._id.toString()}
            gallery={gallery}
            setGallery={setEntryGallery}
            isSelected={
              selectedGallery?._id.toString() === gallery._id.toString()
            }
          />
        ))}

        <CreateGalleryDialogButton
          source={source}
          buttonClassName="font-bold h-20"
          
          buttonText={
            noGalleries ? "Create your first gallery!" : "Create New Gallery"
          }
          buttonVariant={noGalleries ? "default" : "outline"}
        />
      </div>
    );
  }


  return (
    <div className="relative">
      <Button
        onClick={handleRemoveGallery}
        size="sm"
        className="absolute -top-2 -left-2 z-2"
   
      >
        <TrashIcon />
      </Button>

      <GalleryCard gallery={entryGallery} isSelected={false} />
    </div>
  );
};

export default SelectGalleryEntry;


interface GalleryCardProps {
  gallery: UserVirtualGalleryType;
  setGallery?: (gallery: UserVirtualGalleryType | null) => void;
  isSelected: boolean;
}

const GalleryCard: FC<GalleryCardProps> = ({ gallery, setGallery, isSelected }) => {
  const media = gallery?.items?.[0]?.media;
  const handleClick = () => {
    setGallery?.(gallery);
  };
  const isClickable = setGallery !== undefined;
  return (
    <div
      key={gallery._id.toString()}
      className={cn(
        "w-full flex flex-row items-center justify-start gap-4  p-2 rounded-md shadow",
        isClickable ?
          "cursor-pointer hover:shadow-md transition-shadow duration-200 hover:bg-primary/90 bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground"
        // isSelected ? "border-border" : "border-transparent"
      )}
      onClick={handleClick}
    >
      <div className="size-16">
        {media && <MediaThumbnail media={media} objectFit="object-cover" />}
      </div>
      <P className="font-bold">{gallery.title}</P>
    </div>
  );
 }