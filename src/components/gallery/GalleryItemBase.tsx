import { FC } from "react";
import { GalleryItem, GalleryItemTypes } from "@/types/galleryItem";
import TextItemDisplay from "./TextItemDisplay";
import AssetItemDisplay from "./AssetItemDisplay";

export interface GalleryItemBaseProps {
  item: GalleryItem;
}

const GalleryItemBase: FC<GalleryItemBaseProps> = ({ item }) => {
  if (item.itemType === GalleryItemTypes.Text) {
    return <TextItemDisplay item={item} />;
  }

  if (
    item.itemType === GalleryItemTypes.BlockchainAsset ||
    item.itemType === GalleryItemTypes.UserAsset
  ) {
    return <AssetItemDisplay item={item} />;
  }

  //TODO create and handle other item types
};

export default GalleryItemBase;
