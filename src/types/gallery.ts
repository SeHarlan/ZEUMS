
import { BlockchainAssetEntry, UserAssetEntry } from "./entry";
import { Schema } from "mongoose";

export type GalleryItem = UserAssetEntry | BlockchainAssetEntry;

export enum GalleryDisplayTypes { 
  Grid = "grid",
  //TODO: figure out how to store which items go in which rows
  // FitHorizontal = "fit_horizontal",
  // Masonry = "masonry",
}

export type BaseGalleryType = {
  title: string;
  description?: string;
  displayType: GalleryDisplayTypes;
  itemIds: Schema.Types.ObjectId[];
};

export type GalleryType = BaseGalleryType & {
  items: GalleryItem[];
}