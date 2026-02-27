import MediaThumbnail from "@/components/media/MediaThumbnail";
import { P } from "@/components/typography/Typography";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { EDIT_GALLERY } from "@/constants/clientRoutes";
import { useEditGallerySettings } from "@/context/EditGallerySettingsProvider";
import { UserVirtualGalleryType } from "@/types/gallery";
import { getBlobUrlBuilderPropsFromItemOrEntry } from "@/utils/media";
import { EditIcon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { FC, useMemo } from "react";

interface EditableGalleryCardProps { 
  gallery: UserVirtualGalleryType;
}
const EditableGalleryCard: FC<EditableGalleryCardProps> = ({ gallery }) => {
  const router = useRouter();
  const { openDeleteDrawer, openEditDrawer, galleryToDelete } =
    useEditGallerySettings();

  const handleClick = (galleryId: string) => {
    router.push(EDIT_GALLERY(galleryId));
  };

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    openDeleteDrawer(gallery);
  };

  const handleEdit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    openEditDrawer(gallery);
  };

  // Get the first item's media for the thumbnail
  const itemOne = gallery.items?.[0];

  const blobUrlBuilderProps = useMemo(() => {
    return getBlobUrlBuilderPropsFromItemOrEntry(itemOne);
  }, [itemOne]);

  return (
    <Card
      key={gallery._id.toString()}
      className="p-0 cursor-pointer gap-1 rounded-lg"
      onClick={() => handleClick(gallery._id.toString())}
    >
      <CardContent className="relative p-0">
        <div className="z-10 absolute -top-3 -right-3 flex gap-2">
          <Button
            onClick={handleDelete}
            variant="destructive"
            loading={galleryToDelete?._id.toString() === gallery._id.toString()}
            size="icon"
          >
            <Trash2Icon />
          </Button>
          <Button
            onClick={handleEdit}
            variant="default"
            disabled={!!galleryToDelete}
            size="icon"
          >
            <EditIcon />
          </Button>
        </div>
        {itemOne ? (
          <MediaThumbnail media={itemOne.media} blobUrlBuilderProps={blobUrlBuilderProps} />
        ) : (
          <AspectRatio
            ratio={1}
            className="flex justify-center items-center bg-muted text-muted-foreground overflow-hidden"
          >
            <P className="font-serif text-5xl font-bold">
              {gallery.title.charAt(0).toUpperCase()}
            </P>
          </AspectRatio>
        )}
      </CardContent>
      <CardFooter className="pb-1 px-3">
        <P className="text-lg font-semibold line-clamp-1">{gallery.title}</P>
      </CardFooter>
    </Card>
  );
};

export default EditableGalleryCard;