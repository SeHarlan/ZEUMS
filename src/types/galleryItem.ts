import { Schema } from "mongoose";
import { GalleryType } from "./gallery";
import {
  BlockchainImage,
  BlockchainMedia,
  UserImage,
  UserMedia,
} from "./media";
import { ChainIdsEnum } from "./wallet";
import { BlockchainAttribute, BlockchainCreator, BlockchainOwner, EntryButton, EntrySource } from "./entry";

export enum GalleryItemTypes {
  BlockchainAsset = "gallery_blockchain_asset",
  UserAsset = "gallery_user_asset",
  Gallery = "gallery_reference",
  Text = "gallery_text",
}
// Base properties shared by all entry types
export type BaseGalleryItem = {
  _id: Schema.Types.ObjectId;
  /** User ID of the galleryItem owner */
  owner: Schema.Types.ObjectId;
  parentGalleryId: Schema.Types.ObjectId;
  /** Source of the galleryItem (creator or collector) */
  source: EntrySource;
  title?: string;
  description?: string;
  buttons?: EntryButton[];
  position: [number, number];
};

export type TextGalleryItem = BaseGalleryItem & {
  itemType: GalleryItemTypes.Text;
};

export type UserAssetGalleryItem = BaseGalleryItem & {
  itemType: GalleryItemTypes.UserAsset;
  media: UserImage | UserMedia;
};


export type BlockchainAssetGalleryItem = BaseGalleryItem & {
  title: string;
  itemType: GalleryItemTypes.BlockchainAsset;
  media: BlockchainImage | BlockchainMedia;
  /** Blockchain address of the NFT */
  tokenAddress: string;
  onChainCreators: BlockchainCreator[];
  onChainOwner: BlockchainOwner;
  blockchain: ChainIdsEnum;
  attributes: BlockchainAttribute[];
};

// Gallery Item reference types
export type BaseGalleryReferenceGalleryItem = BaseGalleryItem & {
  itemType: GalleryItemTypes.Gallery;
  galleryId: Schema.Types.ObjectId;
};

export type GalleryReferenceGalleryItem = BaseGalleryReferenceGalleryItem & {
  gallery: GalleryType;
};

// Combined type using discriminated union
export type GalleryItem =
  | TextGalleryItem
  | BlockchainAssetGalleryItem
  | UserAssetGalleryItem
  | GalleryReferenceGalleryItem;

// Types related to entry CRUD
export type GalleryItemCreation = Omit<GalleryItem, "owner" | "_id">;


// Type guard functions
export function isBlockchainGalleryItem(
  item: GalleryItem | GalleryItemCreation
): item is BlockchainAssetGalleryItem {
  return item.itemType === GalleryItemTypes.BlockchainAsset;
}

export function isUserAssetGalleryItem(
  item: GalleryItem | GalleryItemCreation
): item is UserAssetGalleryItem {
  return item.itemType === GalleryItemTypes.UserAsset;
}

export function isTextGalleryItem(
  item: GalleryItem | GalleryItemCreation
): item is TextGalleryItem {
  return item.itemType === GalleryItemTypes.Text;
}

export function isGalleryReferenceGalleryItem(
  item: GalleryItem | GalleryItemCreation
): item is GalleryReferenceGalleryItem {
  return item.itemType === GalleryItemTypes.Gallery;
}
