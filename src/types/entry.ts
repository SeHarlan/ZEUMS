import { Schema } from "mongoose";
import { GalleryType } from "./gallery";
import { BlockchainImage, BlockchainMedia, UserImage, UserMedia } from "./media"
import { ChainIdsEnum } from "./wallet";


export enum EntryTypes {
  BlockchainAsset = "blockchain_asset",
  UserAsset = "user_asset",
  Gallery = "gallery",
  Text = "text",
}

export enum EntrySource {
  Creator = "creator",
  Collector = "collector",
}

export type EntryButton = {
  text: string;
  url: string;
};

// Base properties shared by all entry types
export type BaseEntry = {
  _id: Schema.Types.ObjectId;
  /** User ID of the entry owner */
  owner: Schema.Types.ObjectId;
  date: Date;
  /** Source of the entry (creator or collector) */
  source: EntrySource;
  title?: string;
  description?: string;
  buttons?: EntryButton[];
};

export type TextEntry = BaseEntry & {
  entryType: EntryTypes.Text;
};

export type UserAssetEntry = BaseEntry & {
  entryType: EntryTypes.UserAsset;
  media: UserImage | UserMedia;
};


//Blockchain Entry types
export type BlockchainCreator = {
  /** Blockchain address of the creator */
  address: string;
  /** Ownership/Royalty Percentage  */
  share: number;
  /** User ID of the creator, if available */
  userId?: Schema.Types.ObjectId;
};

export type BlockchainOwner = {
  /** Blockchain address of the owner */
  address: string;
  /** User ID of the owner, if available */
  userId?: Schema.Types.ObjectId;
}

export type BlockchainAttribute = {
  type: string;
  value: string;
}

export type BlockchainAssetEntry = BaseEntry & {
  title: string;
  entryType: EntryTypes.BlockchainAsset;
  media: BlockchainImage | BlockchainMedia;
  /** Blockchain address of the NFT */
  tokenAddress: string;
  onChainCreators: BlockchainCreator[];
  onChainOwner: BlockchainOwner;
  blockchain: ChainIdsEnum
  attributes: BlockchainAttribute[];
};

// Gallery Entry types
export type BaseGalleryEntry = BaseEntry & {
  entryType: EntryTypes.Gallery;
  galleryId: Schema.Types.ObjectId;
}

export type GalleryEntry = BaseGalleryEntry & {
  gallery: GalleryType;
}

// Combined type using discriminated union
export type TimelineEntry = TextEntry | BlockchainAssetEntry | UserAssetEntry | GalleryEntry;

// Types related to entry CRUD
export type TimelineEntryCreation = Omit<TimelineEntry, "owner" | "_id">

export type TimelineEntryDateUpdate = {
  _id: Schema.Types.ObjectId;
  date: Date;
}

// Type guard functions
export function isBlockchainAssetEntry(entry: TimelineEntry | TimelineEntryCreation): entry is BlockchainAssetEntry {
  return entry.entryType === EntryTypes.BlockchainAsset
}

export function isUserAssetEntry(entry: TimelineEntry): entry is UserAssetEntry {
  return entry.entryType === EntryTypes.UserAsset
}

export function isTextEntry(entry: TimelineEntry): entry is TextEntry {
  return entry.entryType === EntryTypes.Text;
}

export function isGalleryEntry(entry: TimelineEntry): entry is GalleryEntry {
  return entry.entryType === EntryTypes.Gallery;
}