import {
  GALLERY_ITEM_MODEL_KEY,
  GALLERY_ITEMS_FOREIGN_KEY,
  GALLERY_ITEMS_VIRTUAL,
  GALLERY_MODEL_KEY,
  GALLERY_OWNER_DATA_FOREIGN_KEY,
  GALLERY_OWNER_FOREIGN_KEY,
  GALLERY_TOTAL_ITEMS_VIRTUAL,
  USER_MODEL_KEY,
} from "@/constants/databaseKeys";
import { EntrySource } from "@/types/entry";
import {
  BaseGalleryType,
  GalleryDisplayTypes,
} from "@/types/gallery";
import { GalleryItemTypes } from "@/types/galleryItem";
import mongoose, { Document, Model, Schema } from "mongoose";
import { MediaSchema } from "../Entry/media";

// Document interface
export interface GalleryDocument extends Document<Schema.Types.ObjectId>, BaseGalleryType { }

// Gallery Schema
const GallerySchema = new Schema<GalleryDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    displayType: {
      type: String,
      enum: Object.values(GalleryDisplayTypes),
      default: GalleryDisplayTypes.Justify,
      required: true,
    },
    bannerImage: { type: MediaSchema },
    [GALLERY_OWNER_FOREIGN_KEY]: {
      type: Schema.Types.ObjectId,
      ref: USER_MODEL_KEY,
      required: true,
    },
    source: {
      type: String,
      enum: Object.values(EntrySource),
      default: EntrySource.Creator,
      required: true,
    },
    hideItemTitles: {
      type: Boolean,
      default: false,
    },
    hideItemDescriptions: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }, // Include virtuals in JSON output
    toObject: { virtuals: true }, // Include virtuals in object output
  }
);

// Add virtual for gallery items
GallerySchema.virtual(GALLERY_ITEMS_VIRTUAL, {
  ref: GALLERY_ITEM_MODEL_KEY,
  localField: "_id",
  foreignField: GALLERY_ITEMS_FOREIGN_KEY,
});

// Add virtual for total items count - this will work when items are populated
GallerySchema.virtual(GALLERY_TOTAL_ITEMS_VIRTUAL, {
  ref: GALLERY_ITEM_MODEL_KEY,
  localField: "_id",
  foreignField: GALLERY_ITEMS_FOREIGN_KEY,
  count: true
});

GallerySchema.virtual(GALLERY_OWNER_DATA_FOREIGN_KEY, {
  ref: USER_MODEL_KEY,
  localField: GALLERY_OWNER_FOREIGN_KEY,
  foreignField: "_id",
  justOne: true,
});

// Add compound index to ensure unique gallery names per user
GallerySchema.index({ [GALLERY_OWNER_FOREIGN_KEY]: 1, title: 1 }, { unique: true });

export const GalleryWithItemsPopulate = {
  path: GALLERY_ITEMS_VIRTUAL,
  model: GALLERY_ITEM_MODEL_KEY,
  options: { sort: { "position.0": 1, "position.1": 1 } },
};

export const GalleryWithBasicOwnerPopulate = {
  path: GALLERY_OWNER_DATA_FOREIGN_KEY,
  model: USER_MODEL_KEY,
  select: "username displayName profileImage",
};

// Populate configuration for gallery entries that includes only the first two rows of items
export const GalleryWithFirstTwoRowsPopulate = {
  path: GALLERY_ITEMS_VIRTUAL,
  model: GALLERY_ITEM_MODEL_KEY,
  match: { 
    "position.0": { $in: [0, 1] }
  },
  options: { 
    sort: { "position.0": 1, "position.1": 1 } 
  },
};

// Populate configuration for gallery entries that includes only the first media item
export const GalleryWithFirstMediaPopulate = {
  path: GALLERY_ITEMS_VIRTUAL,
  model: GALLERY_ITEM_MODEL_KEY,
  match: { 
    itemType: { 
      $in: [GalleryItemTypes.BlockchainAsset, GalleryItemTypes.UserAsset] 
    } 
  },
  options: { 
    limit: 1,
    sort: { "position.1": 1, "position.0": 1 }
  }
};

// Create the model
const Gallery: Model<GalleryDocument> =
  mongoose.models[GALLERY_MODEL_KEY] || 
  mongoose.model<GalleryDocument>(GALLERY_MODEL_KEY, GallerySchema);

export default Gallery;
