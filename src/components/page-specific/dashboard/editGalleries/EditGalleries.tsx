"use client";

import { useUser } from "@/context/UserProvider";
import { EntrySource } from "@/types/entry";
import { FC, useState } from "react";
import CreateGalleryDialogButton from "./CreateGalleryDialog";
import DeleteGalleryDialog from "./DeleteGalleryDialog";
import MediaThumbnail from "@/components/media/MediaThumbnail";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { P } from "@/components/typography/Typography";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { EDIT_GALLERY } from "@/constants/clientRoutes";
import { Button } from "@/components/ui/button";
import { EditIcon, Trash2Icon } from "lucide-react";
import { UserVirtualGalleryType } from "@/types/gallery";

interface EditGalleriesProps {
  source: EntrySource;
}
const EditGalleries: FC<EditGalleriesProps> = ({ source }) => { 
  const { user } = useUser();
  const router = useRouter();
  const [galleryToDelete, setGalleryToDelete] =
    useState<UserVirtualGalleryType | null>(null);


  const galleriesMap = {
    [EntrySource.Creator]: user?.createdGalleries,
    [EntrySource.Collector]: user?.collectedGalleries,
  };

  const galleries = (galleriesMap[source] || [])

  const handleClick = (galleryId: string) => {
    router.push(EDIT_GALLERY(galleryId));
  };

  const handleDelete = (gallery: UserVirtualGalleryType) => { 
    setGalleryToDelete(gallery);
  }

  const handleCloseDeleteDialog = () => {
    setGalleryToDelete(null);
  }

  return (
    <div className="space-y-6">
      <CreateGalleryDialogButton source={source} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {galleries.map((gallery) => (
          <Card
            key={gallery._id.toString()}
            className="p-0 cursor-pointer gap-1 rounded-lg"
            onClick={() => handleClick(gallery._id.toString())}
          >
            <CardContent className="relative p-0">
              <div className="z-10 absolute -top-3 -right-3 flex gap-2">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(gallery);
                  }}
                  variant="destructive"
                  loading={
                    galleryToDelete?._id.toString() === gallery._id.toString()
                  }
                  size="icon"
                >
                  <Trash2Icon />
                </Button>
                <Button
                  onClick={() => handleClick(gallery._id.toString())}
                  variant="default"
                  disabled={!!galleryToDelete}
                  size="icon"
                >
                  <EditIcon />
                </Button>
              </div>
              {gallery.items?.[0] ? (
                <MediaThumbnail media={gallery.items[0].media} />
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
              <P className="text-lg font-semibold line-clamp-1">
                {gallery.title}
              </P>
            </CardFooter>
          </Card>
        ))}
      </div>
      <DeleteGalleryDialog
        gallery={galleryToDelete}
        onClose={handleCloseDeleteDialog}
        source={source}
      />
    </div>
  );
}
export default EditGalleries;
