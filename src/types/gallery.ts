
import { Schema } from "mongoose";
import { GalleryItem, GalleryMediaItem } from "./galleryItem";
import { EntrySource } from "./entry";

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
};

export type GalleryType = BaseGalleryType & {
  items?: GalleryItem[];
}

export type UserVirtualGalleryType = BaseGalleryType & {
  items?: GalleryMediaItem[];
};