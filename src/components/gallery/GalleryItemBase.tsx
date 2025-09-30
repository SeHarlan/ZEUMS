import { FC } from "react";
import { GalleryItem, GalleryItemTypes } from "@/types/galleryItem";
import TextItemDisplay from "./TextItemDisplay";
import AssetItemDisplay from "./AssetItemDisplay";

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
