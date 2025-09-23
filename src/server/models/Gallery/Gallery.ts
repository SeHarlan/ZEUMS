import mongoose, { Schema, Document, Model } from "mongoose";
import { 
  BaseGalleryType, 
  GalleryDisplayTypes,
} from "@/types/gallery";
import { 
  GALLERY_ITEM_MODEL_KEY,
  GALLERY_ITEMS_FOREIGN_KEY,
  GALLERY_ITEMS_VIRTUAL,
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

// Create the model
const Gallery: Model<GalleryDocument> =
  mongoose.models[GALLERY_MODEL_KEY] || 
  mongoose.model<GalleryDocument>(GALLERY_MODEL_KEY, GallerySchema);

export default Gallery;
