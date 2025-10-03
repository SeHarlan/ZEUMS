import mongoose, { Schema, Document, Model } from "mongoose";
import { 
  BaseGalleryType, 
  GalleryDisplayTypes,
} from "@/types/gallery";
import { EntrySource } from "@/types/entry";
import { 
  GALLERY_ITEM_MODEL_KEY,
  GALLERY_ITEMS_FOREIGN_KEY,
  GALLERY_ITEMS_VIRTUAL,
  GALLERY_TOTAL_ITEMS_VIRTUAL,
  GALLERY_MODEL_KEY,
  GALLERY_OWNER_FOREIGN_KEY,
  USER_MODEL_KEY,
} from "@/constants/databaseKeys";

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
      default: false,
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

export const GalleryWithItemsPopulate = {
  path: GALLERY_ITEMS_VIRTUAL,
  model: GALLERY_ITEM_MODEL_KEY,
  options: { sort: { "position.0": 1, "position.1": 1 } },
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

// Create the model
const Gallery: Model<GalleryDocument> =
  mongoose.models[GALLERY_MODEL_KEY] || 
  mongoose.model<GalleryDocument>(GALLERY_MODEL_KEY, GallerySchema);

export default Gallery;
