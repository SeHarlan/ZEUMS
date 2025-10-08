import MediaThumbnail from "@/components/media/MediaThumbnail";
import { Button } from "@/components/ui/button";
import { EntrySource } from "@/types/entry";
import { GalleryVerticalIcon, TrashIcon } from "lucide-react";
import { FC, useState } from "react";
import { useUser } from "@/context/UserProvider";
import { getGalleryKey } from "@/utils/gallery";
import { P } from "../typography/Typography";
import { UserVirtualGalleryType } from "@/types/gallery";
import { cn } from "@/utils/ui-utils";
import ScrollableDialog from "../general/ScrollableDialog";
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
  const handleSelectGallery = () => {
    setEntryGallery(selectedGallery);
  };
  const handleRemoveGallery = () => {
    setEntryGallery(null);
    setSelectedGallery(null);
  };

  if (entryGallery === null) {
    return (
      <ScrollableDialog
        trigger={
          <div className="p-2 flex flex-col items-center justify-center gap-4">
            <GalleryVerticalIcon className="size-12 text-muted-foreground" />
            <Button type="button">Choose gallery to link</Button>
          </div>
        }
        footerContent={!noGalleries ? (
          <Button type="button" onClick={handleSelectGallery}>
            Select
            <GalleryVerticalIcon />
          </Button>
        ) : null}
        title="Select Gallery To Link"
        description="Select a gallery to link to on your timeline."
      >
        <div className="flex flex-col gap-4 items-start">
          {galleries?.map((gallery) => (
            <GalleryCard
              key={gallery._id.toString()}
              gallery={gallery}
              setGallery={setSelectedGallery}
              isSelected={
                selectedGallery?._id.toString() === gallery._id.toString()
              }
            />
          ))}
          {noGalleries ? (
            <CreateGalleryDialogButton
              source={source}
              buttonClassName="h-16"
              buttonText="Create your first gallery!"
              buttonVariant="default"
            />
          ) : null}
        </div>
      </ScrollableDialog>
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
        "w-full flex flex-row items-center justify-start gap-4 bg-muted p-2 rounded-md shadow",
        isClickable &&
          "cursor-pointer border-3  hover:shadow-md transition-shadow duration-200",
        isSelected ? "border-primary" : "border-transparent"
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