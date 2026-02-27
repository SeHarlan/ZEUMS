import mongoose, { Schema, Document, Model } from "mongoose";
import {
  BaseGalleryItem,
  type TextGalleryItem,
  type UserAssetGalleryItem,
  type BlockchainAssetGalleryItem,
  type BaseGalleryReferenceGalleryItem,
  GalleryItemTypes,
} from "@/types/galleryItem";
import { 
  EntrySource,
} from "@/types/entry";
import { MediaSchema } from "../Entry/media";
import { 
  GALLERY_ITEM_DISCRIMINATOR_KEY, 
  GALLERY_ITEM_FOREIGN_KEY, 
  GALLERY_ITEM_PARENT_FIELD,
  GALLERY_ITEM_MODEL_KEY,
  USER_MODEL_KEY,
  GALLERY_MODEL_KEY,
  GALLERY_ENTRY_LOCAL_FIELD,
  GALLERY_ENTRY_VIRTUAL,
} from "@/constants/databaseKeys";
import { ChainIdsEnum } from "@/types/wallet";
import { EntryButtonSchema } from "../Entry/Entry";

// Document interfaces
export interface GalleryItemDocument extends Document, Omit<BaseGalleryItem, "_id"> {
  [GALLERY_ITEM_DISCRIMINATOR_KEY]: GalleryItemTypes;
}

export interface TextGalleryItemDocument extends Document, Omit<TextGalleryItem, "_id"> {}
export interface UserAssetGalleryItemDocument extends Document, Omit<UserAssetGalleryItem, "_id"> {}
export interface BlockchainAssetGalleryItemDocument extends Document, Omit<BlockchainAssetGalleryItem, "_id"> {}
export interface GalleryReferenceGalleryItemDocument extends Document, Omit<BaseGalleryReferenceGalleryItem, "_id"> {}

// Position validation for [x, y] coordinates
const positionValidation = {
  validator: function (v: number[]) {
    return Array.isArray(v) && v.length === 2 && v.every(coord => typeof coord === 'number');
  },
  message: "Position must be an array of exactly 2 numbers [x, y]"
};

// Base GalleryItem Schema
const GalleryItemSchema = new Schema<GalleryItemDocument>(
  {
    // Discriminator field
    [GALLERY_ITEM_DISCRIMINATOR_KEY]: {
      type: String,
      required: true,
      enum: Object.values(GalleryItemTypes),
    },
    // Owner reference
    [GALLERY_ITEM_FOREIGN_KEY]: {
      type: Schema.Types.ObjectId,
      ref: USER_MODEL_KEY,
      required: true,
    },
    // Parent gallery reference
    [GALLERY_ITEM_PARENT_FIELD]: {
      type: Schema.Types.ObjectId,
      ref: GALLERY_MODEL_KEY,
      required: true,
    },
    // Source of the galleryItem (creator or collector)
    source: {
      type: String,
      enum: Object.values(EntrySource),
      default: EntrySource.Creator,
      required: true,
    },
    // Common fields for all gallery item types
    title: String,
    description: String,
    buttons: [EntryButtonSchema],
    position: {
      type: [Number],
      required: true,
      validate: positionValidation,
    },
  },
  {
    discriminatorKey: GALLERY_ITEM_DISCRIMINATOR_KEY,
    timestamps: true,
  }
);

// Create the base model
const GalleryItem: Model<GalleryItemDocument> =
  mongoose.models[GALLERY_ITEM_MODEL_KEY] || 
  mongoose.model<GalleryItemDocument>(GALLERY_ITEM_MODEL_KEY, GalleryItemSchema);

// Text GalleryItem Schema
const TextGalleryItemSchema = new Schema<TextGalleryItemDocument>({
  // No additional fields beyond base schema
});

const TextGalleryItem = GalleryItem.discriminators?.[GalleryItemTypes.Text] ||
  GalleryItem.discriminator<TextGalleryItemDocument>(GalleryItemTypes.Text, TextGalleryItemSchema);

// User Asset GalleryItem Schema
const UserAssetGalleryItemSchema = new Schema<UserAssetGalleryItemDocument>({
  media: {
    type: MediaSchema,
    required: true,
  }
});

const UserAssetGalleryItem = GalleryItem.discriminators?.[GalleryItemTypes.UserAsset] ||
  GalleryItem.discriminator<UserAssetGalleryItemDocument>(GalleryItemTypes.UserAsset, UserAssetGalleryItemSchema);

// Blockchain Asset GalleryItem Schema
const BlockchainAssetGalleryItemSchema =
  new Schema<BlockchainAssetGalleryItemDocument>({
    // Title is required for blockchain assets
    title: {
      type: String,
      required: true,
    },
    media: {
      type: MediaSchema,
      required: true,
    },
    blockchain: {
      type: String,
      enum: Object.values(ChainIdsEnum),
      required: true,
    },
    tokenAddress: {
      type: String,
      required: true,
    },
    onChainCreators: [
      {
        address: { type: String, required: true },
        share: { type: Number, required: true },
        userId: {
          type: Schema.Types.ObjectId,
          ref: USER_MODEL_KEY,
        },
      },
    ],
    onChainOwner: {
      address: { type: String, required: true },
      userId: {
        type: Schema.Types.ObjectId,
        ref: USER_MODEL_KEY,
      },
    },

    attributes: [
      {
        trait_type: { type: String, required: true },
        value: { type: Schema.Types.Mixed, required: true },
        display_type: String,
      },
    ],
    integrations: [
      {
        type: { type: String, enum: ["exchange", "mallow"], required: true },
        action: { type: String, enum: ["link"], required: true },
      },
    ],
  });

const BlockchainAssetGalleryItem = GalleryItem.discriminators?.[GalleryItemTypes.BlockchainAsset] ||
  GalleryItem.discriminator<BlockchainAssetGalleryItemDocument>(
    GalleryItemTypes.BlockchainAsset, 
    BlockchainAssetGalleryItemSchema
  );

// Gallery Reference GalleryItem Schema
const GalleryReferenceGalleryItemSchema = new Schema<GalleryReferenceGalleryItemDocument>({
  [GALLERY_ENTRY_LOCAL_FIELD]: {
    type: Schema.Types.ObjectId,
    ref: GALLERY_MODEL_KEY,
    required: true,
  },
});

// Add virtual for gallery
GalleryReferenceGalleryItemSchema.virtual(GALLERY_ENTRY_VIRTUAL, {
  ref: GALLERY_MODEL_KEY,
  foreignField: "_id",
  localField: GALLERY_ENTRY_LOCAL_FIELD,
  justOne: true,
});

export const GalleryReferenceGalleryItemVirtual = {
  path: GALLERY_ENTRY_VIRTUAL,
  model: GALLERY_MODEL_KEY,
};

const GalleryReferenceGalleryItem = GalleryItem.discriminators?.[GalleryItemTypes.Gallery] ||
  GalleryItem.discriminator<GalleryReferenceGalleryItemDocument>(GalleryItemTypes.Gallery, GalleryReferenceGalleryItemSchema);

// Export models
export {
  GalleryItem as default,
  TextGalleryItem,
  UserAssetGalleryItem,
  BlockchainAssetGalleryItem,
  GalleryReferenceGalleryItem
};
