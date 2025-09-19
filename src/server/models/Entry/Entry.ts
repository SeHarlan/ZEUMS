import mongoose, { Schema, Document, Model } from "mongoose";
import { 
  BaseEntry, 
  EntryTypes, 
  EntryButton,
  EntrySource,
} from "@/types/entry";
import type {
  TextEntry,
  UserAssetEntry,
  BlockchainAssetEntry,
  BaseGalleryEntry,
} from "@/types/entry";
import { MediaSchema } from "./media";
import { ENTRY_DISCRIMINATOR_KEY, ENTRY_FOREIGN_KEY, ENTRY_MODEL_KEY, GALLERY_ENTRY_LOCAL_FIELD, GALLERY_MODEL_KEY, USER_MODEL_KEY } from "@/constants/databaseKeys";
import { ChainIdsEnum } from "@/types/wallet";

// Document interfaces
export interface EntryDocument extends Document, Omit<BaseEntry, "_id"> {
  [ENTRY_DISCRIMINATOR_KEY]: EntryTypes;
}

export interface TextEntryDocument extends Document, Omit<TextEntry, "_id"> {}
export interface UserAssetEntryDocument extends Document, Omit<UserAssetEntry, "_id"> {}
export interface BlockchainAssetEntryDocument extends Document, Omit<BlockchainAssetEntry, "_id"> { }
export interface GalleryEntryDocument extends Document, Omit<BaseGalleryEntry , "_id">{}

export const websiteValidation = {
  validator: function (v: string) {
    return !v || /^https?:\/\//.test(v);
  },
  message: "Website URL must start with http:// or https://",
};

const EntryButtonSchema = new Schema<EntryButton>(
  {
    text: { type: String, required: true },
    url: { type: String, required: true, validate: websiteValidation }
  },
  { _id: false }
);

// Base Entry Schema
const EntrySchema = new Schema<EntryDocument>(
  {
    // Discriminator field
    [ENTRY_DISCRIMINATOR_KEY]: {
      type: String,
      required: true,
      enum: Object.values(EntryTypes),
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    source: {
      type: String,
      enum: Object.values(EntrySource),
      default: EntrySource.Creator, // Default to creator
      required: true,
    },
    // Common fields for all entry types
    [ENTRY_FOREIGN_KEY]: {
      type: Schema.Types.ObjectId,
      ref: USER_MODEL_KEY,
      required: true,
    },
    title: String,
    description: String,
    buttons: [EntryButtonSchema],
  },
  {
    discriminatorKey: ENTRY_DISCRIMINATOR_KEY,
    timestamps: true,
  }
);

// Create the base model
const Entry: Model<EntryDocument> =
  mongoose.models[ENTRY_MODEL_KEY] || 
  mongoose.model<EntryDocument>(ENTRY_MODEL_KEY, EntrySchema);



// Text Entry Schema
const TextEntrySchema = new Schema<TextEntryDocument>({
  // No additional fields
});

const TextEntry = Entry.discriminators?.[EntryTypes.Text] ||
  Entry.discriminator<TextEntryDocument>(EntryTypes.Text, TextEntrySchema);



// User Asset Entry Schema
const UserAssetEntrySchema = new Schema<UserAssetEntryDocument>({
  media: MediaSchema
});

const UserAssetEntry = Entry.discriminators?.[EntryTypes.UserAsset] ||
  Entry.discriminator<UserAssetEntryDocument>(EntryTypes.UserAsset, UserAssetEntrySchema);

// Blockchain Asset Entry Schemas
const BlockchainAssetEntrySchema = new Schema<BlockchainAssetEntryDocument>({
  media: MediaSchema,
  blockchain: {
    type: String,
    enum: Object.values(ChainIdsEnum),
    required: true,
  },
  tokenAddress: {
    type: String,
    required: true
  },
  onChainCreators: [{
    address: { type: String, required: true },
    share: { type: Number, required: true },
    userId: {
      type: Schema.Types.ObjectId,
      ref: USER_MODEL_KEY
    }
  }],
  onChainOwner: {
    address: { type: String, required: true },
    userId: {
      type: Schema.Types.ObjectId,
      ref: USER_MODEL_KEY
    }
  }
});

const BlockchainAssetEntry = Entry.discriminators?.[EntryTypes.BlockchainAsset] ||
  Entry.discriminator<BlockchainAssetEntryDocument>(
    EntryTypes.BlockchainAsset, 
    BlockchainAssetEntrySchema
  );


// Gallery Entry Schema
const GalleryEntrySchema = new Schema<GalleryEntryDocument>({
  [GALLERY_ENTRY_LOCAL_FIELD]: {
    type: Schema.Types.ObjectId,
    ref: GALLERY_MODEL_KEY,
    required: true
  }
});

// Add virtual for gallery
GalleryEntrySchema.virtual("gallery", {
  ref: GALLERY_MODEL_KEY,
  foreignField: "_id",
  localField: GALLERY_ENTRY_LOCAL_FIELD,
  justOne: true,
});

const GalleryEntry = Entry.discriminators?.[EntryTypes.Gallery] ||
  Entry.discriminator<GalleryEntryDocument>(EntryTypes.Gallery, GalleryEntrySchema);

// Export models
export {
  Entry as default,
  TextEntry,
  UserAssetEntry,
  BlockchainAssetEntry,
  GalleryEntry
};