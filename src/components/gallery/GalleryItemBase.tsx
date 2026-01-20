import { ImageSizing } from "@/constants/ui";
import { GalleryItem, GalleryItemTypes } from "@/types/galleryItem";
import { FC } from "react";
import MediaThumbnail from "../media/MediaThumbnail";
import { P } from "../typography/Typography";
import AssetItemDisplay from "./AssetItemDisplay";
import TextItemDisplay from "./TextItemDisplay";

export interface GalleryItemBaseProps {
  item: GalleryItem;
  /**passed to AssetItemDisplay*/
  hideTitle?: boolean;
  hideDescription?: boolean;
  /**passed to AssetItemDisplay*/
  sizeDivisor?: number;
}

const GalleryItemBase: FC<GalleryItemBaseProps> = ({ item, hideTitle, hideDescription, sizeDivisor}) => {
  if (item.itemType === GalleryItemTypes.Text) {
    return <TextItemDisplay item={item} />;
  }

  if (
    item.itemType === GalleryItemTypes.BlockchainAsset ||
    item.itemType === GalleryItemTypes.UserAsset
  ) {
    return <AssetItemDisplay item={item} hideTitle={hideTitle} hideDescription={hideDescription} sizeDivisor={sizeDivisor} />;
  }

  //TODO create and handle other item types
};

export default GalleryItemBase;

interface MiniGalleryItemBaseProps {
  item: GalleryItem;
  priority?: boolean;
  imageSize?: ImageSizing;
}
export const MiniGalleryItemBase: FC<MiniGalleryItemBaseProps> = ({ item, priority, imageSize }) => {
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
        useCustomLoader={false}
        quality={80}
        noPadding
        priority={priority}
        ratio={item.media.aspectRatio}
        objectFit="object-contain"
        media={item.media}
        alt={item.title}
        rounding="rounded-sm"
        size={imageSize}
      />
    );
  }
};