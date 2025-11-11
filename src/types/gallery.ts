
import { Schema } from "mongoose";
import { EntrySource } from "./entry";
import { GalleryItem, GalleryMediaItem } from "./galleryItem";
import { ImageType } from "./media";
import { BaseUserType } from "./user";

export enum GalleryDisplayTypes { 
  Justify = "justify",
  // Grid = "grid",
}

export type BaseGalleryType = {
  _id: Schema.Types.ObjectId;
  owner: Schema.Types.ObjectId;
  title: string;
  description?: string;
  displayType: GalleryDisplayTypes;
  /** Source of the galleryItems (creator or collector) */
  source: EntrySource;
  hideItemTitles?: boolean;
  hideItemDescriptions?: boolean;
  bannerImage?: ImageType | null;
};

type GalleryOwnerData = Pick<BaseUserType, "username" | "displayName" | "profileImage">;

export type GalleryType = BaseGalleryType & {
  items?: GalleryItem[];
  ownerData?: GalleryOwnerData;
}

export type GalleryCreation = Pick<BaseGalleryType, "title" | "description" | "source" | "hideItemTitles" | "hideItemDescriptions"> 

export type UserVirtualGalleryType = BaseGalleryType & {
  items?: GalleryMediaItem[];
  totalItems: number;
};

export type PublicGalleryType = BaseGalleryType & {
  items: GalleryMediaItem[];
  ownerData: GalleryOwnerData;
};