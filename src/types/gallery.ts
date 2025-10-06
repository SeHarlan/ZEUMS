
import { Schema } from "mongoose";
import { GalleryItem, GalleryMediaItem } from "./galleryItem";
import { EntrySource } from "./entry";
import { UserType } from "./user";

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
};

export type GalleryType = BaseGalleryType & {
  items?: GalleryItem[];
  ownerData?: Pick<UserType, "username" | "displayName" | "profileImage">;
}

export type GalleryCreation = Pick<BaseGalleryType, "title" | "description" | "source" | "hideItemTitles" | "hideItemDescriptions"> 

export type UserVirtualGalleryType = BaseGalleryType & {
  items?: GalleryMediaItem[];
  totalItems: number;
};