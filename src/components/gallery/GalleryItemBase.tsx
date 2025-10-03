import { FC } from "react";
import { GalleryItem, GalleryItemTypes } from "@/types/galleryItem";
import TextItemDisplay from "./TextItemDisplay";
import AssetItemDisplay from "./AssetItemDisplay";
import MediaThumbnail from "../media/MediaThumbnail";
import { P } from "../typography/Typography";

export interface GalleryItemBaseProps {
  item: GalleryItem;
  /**passed to AssetItemDisplay*/
  hideTitle?: boolean;
  hideDescription?: boolean;
}

const GalleryItemBase: FC<GalleryItemBaseProps> = ({ item, hideTitle, hideDescription }) => {
  if (item.itemType === GalleryItemTypes.Text) {
    return <TextItemDisplay item={item} />;
  }

  if (
    item.itemType === GalleryItemTypes.BlockchainAsset ||
    item.itemType === GalleryItemTypes.UserAsset
  ) {
    return <AssetItemDisplay item={item} hideTitle={hideTitle} hideDescription={hideDescription} />;
  }

  //TODO create and handle other item types
};

export default GalleryItemBase;

interface MiniGalleryItemBaseProps {
  item: GalleryItem;
  priority?: boolean;
}
export const MiniGalleryItemBase: FC<MiniGalleryItemBaseProps> = ({ item, priority }) => {
  if (item.itemType === GalleryItemTypes.Text) {
    return (
      <div className="text-center w-full p-2">
        <P className="font-bold line-clamp-1">{item.title}</P>
        <P className="text-muted-foreground text-sm line-clamp-1">
          {item.description}
        </P>
      </div>
    );
  }

  if (item.itemType === GalleryItemTypes.BlockchainAsset || item.itemType === GalleryItemTypes.UserAsset) {
    return (
      <MediaThumbnail
        noPadding
        priority={priority}
        ratio={item.media.aspectRatio}
        objectFit="object-contain"
        media={item.media}
        alt={item.title}
        rounding="rounded-sm"
        size="small"
      />
    );
  }
};