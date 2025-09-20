import mongoose, { Schema, Document, Model } from "mongoose";
import { GalleryDisplayTypes } from "@/types/gallery";
import { GALLERY_MODEL_KEY, USER_MODEL_KEY, ENTRY_FOREIGN_KEY } from "@/constants/databaseKeys";

// Document interface
export interface GalleryDocument extends Document {
  title: string;
  description?: string;
  displayType: GalleryDisplayTypes;
  itemIds: Schema.Types.ObjectId[];
  [ENTRY_FOREIGN_KEY]: Schema.Types.ObjectId;
}

// Gallery Schema
const GallerySchema = new Schema<GalleryDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    displayType: {
      type: String,
      enum: Object.values(GalleryDisplayTypes),
      default: GalleryDisplayTypes.Grid,
      required: true,
    },
    itemIds: [{
      type: Schema.Types.ObjectId,
      ref: "Entry", // References to Entry documents
    }],
    [ENTRY_FOREIGN_KEY]: {
      type: Schema.Types.ObjectId,
      ref: USER_MODEL_KEY,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create the model
const Gallery: Model<GalleryDocument> =
  mongoose.models[GALLERY_MODEL_KEY] || 
  mongoose.model<GalleryDocument>(GALLERY_MODEL_KEY, GallerySchema);

export default Gallery;