"use client";

import { useUser } from "@/context/UserProvider";
import { EntrySource } from "@/types/entry";
import { FC } from "react";
import CreateGalleryDialog from "./CreateGalleryDialog";
import MediaThumbnail from "@/components/media/MediaThumbnail";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { P } from "@/components/typography/Typography";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { EDIT_GALLERY } from "@/constants/clientRoutes";

interface EditGalleriesProps {
  source: EntrySource;
}
const EditGalleries: FC<EditGalleriesProps> = ({ source }) => { 
  const { user } = useUser();
  const router = useRouter();

  const galleriesMap = {
    [EntrySource.Creator]: user?.createdGalleries,
    [EntrySource.Collector]: user?.collectedGalleries,
  };
  const galleries = (galleriesMap[source] || [])

  const handleClick = (galleryId: string) => {
    router.push(EDIT_GALLERY(galleryId));
  };

  return (
    <div className="space-y-6">
      <CreateGalleryDialog source={source} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {galleries.map((gallery) => (
          <Card
          key={gallery._id.toString()}
            className="p-0 overflow-hidden cursor-pointer gap-1 rounded-lg"
            onClick={() => handleClick(gallery._id.toString())}
          >
            <CardContent className="p-0">
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
    </div>
  );
}
export default EditGalleries;
