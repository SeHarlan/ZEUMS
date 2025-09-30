import {
  AUTH_USER_MODEL_KEY,
  ENTRY_FOREIGN_KEY,
  ENTRY_MODEL_KEY,
  GALLERY_ITEMS_VIRTUAL,
  GALLERY_MODEL_KEY,
  GALLERY_OWNER_FOREIGN_KEY,
  GALLERY_TOTAL_ITEMS_VIRTUAL,
  USER_AUTH_FOREIGN_KEY,
  USER_AUTH_VIRTUAL,
  USER_COLLECTED_GALLERIES_VIRTUAL,
  USER_COLLECTED_TIMELINE_VIRTUAL,
  USER_CREATED_GALLERIES_VIRTUAL,
  USER_CREATED_TIMELINE_VIRTUAL,
  USER_MODEL_KEY,
  USER_WALLET_VIRTUAL,
  WALLET_FOREIGN_KEY,
  WALLET_MODEL_KEY,
} from "@/constants/databaseKeys";
import { EntrySource } from "@/types/entry";
import { GalleryItemTypes } from "@/types/galleryItem";
import { UserType } from "@/types/user";
import mongoose, { Document, Model, Schema } from "mongoose";
import { MediaSchema } from "./Entry/media";
import { websiteValidation } from "./Entry/Entry";
import { EditTimelineTab } from "@/types/ui/dashboard";

export interface UserDocument extends Document<Schema.Types.ObjectId>, UserType {}

const UserSchema: Schema = new Schema<UserDocument>(
  {
    username: {
      type: String,
      required: true,
      minlength: 2,
      trim: true,
    },
    displayName: { type: String },
    profileImage: { type: MediaSchema },
    bannerImage: { type: MediaSchema },
    email: { type: String },
    bio: { type: String },
    socialHandles: {
      x: { type: String },
      instagram: { type: String },
      tiktok: { type: String },
      facebook: { type: String },
      telegram: { type: String },
      discord: { type: String },
      website: {
        type: String,
        validate: websiteValidation,
      },
    },
    [USER_AUTH_FOREIGN_KEY]: {
      type: Schema.Types.ObjectId,
      ref: AUTH_USER_MODEL_KEY,
      required: false,
      unique: true,
    },
    primaryTimeline: { type: String, enum: Object.values(EditTimelineTab) },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }, // Include virtuals in JSON output
    toObject: { virtuals: true }, // Include virtuals in object output
  }
);

// Make the collection default to this collation at creation time:
UserSchema.set("collation", {
  locale: "en_US", // Most universal locale for international support
  strength: 2, // case-insensitive, accent-sensitive
  normalization: true, // normalize canonically (NFD/NFC issues handled)
});

// Unique index that uses the same collation:
UserSchema.index(
  { username: 1 },
  {
    unique: true,
    collation: { locale: "en_US", strength: 2, normalization: true },
  }
);

UserSchema.virtual(USER_WALLET_VIRTUAL, {
  ref: WALLET_MODEL_KEY,
  localField: "_id",
  foreignField: WALLET_FOREIGN_KEY,
});

// virtual form timelines
UserSchema.virtual(USER_CREATED_TIMELINE_VIRTUAL, {
  ref: ENTRY_MODEL_KEY,
  localField: "_id",
  foreignField: ENTRY_FOREIGN_KEY,
  match: { source: EntrySource.Creator },
});
UserSchema.virtual(USER_COLLECTED_TIMELINE_VIRTUAL, {
  ref: ENTRY_MODEL_KEY,
  localField: "_id",
  foreignField: ENTRY_FOREIGN_KEY,
  match: { source: EntrySource.Collector },
});

// virtual for users galleries
UserSchema.virtual(USER_CREATED_GALLERIES_VIRTUAL, {
  ref: GALLERY_MODEL_KEY,
  localField: "_id",
  foreignField: GALLERY_OWNER_FOREIGN_KEY,
  match: { source: EntrySource.Creator },
});

UserSchema.virtual(USER_COLLECTED_GALLERIES_VIRTUAL, {
  ref: GALLERY_MODEL_KEY,
  localField: "_id",
  foreignField: GALLERY_OWNER_FOREIGN_KEY,
  match: { source: EntrySource.Collector },
});

// virtual for the auth user (next-auth)
UserSchema.virtual(USER_AUTH_VIRTUAL, {
  ref: AUTH_USER_MODEL_KEY,
  localField: USER_AUTH_FOREIGN_KEY,
  foreignField: "_id",
  justOne: true,
});

export const WalletUserVirtual = {
  path: USER_WALLET_VIRTUAL,
  model: WALLET_MODEL_KEY,
};
export const CreatedTimelineUserVirtual = {
  path: USER_CREATED_TIMELINE_VIRTUAL,
  model: ENTRY_MODEL_KEY,
  options: { sort: { date: "descending" } },
};
export const CollectedTimelineUserVirtual = {
  path: USER_COLLECTED_TIMELINE_VIRTUAL,
  model: ENTRY_MODEL_KEY,
  options: { sort: { date: "descending" } },
};
export const AuthUserVirtual = {
  path: USER_AUTH_VIRTUAL,
  model: AUTH_USER_MODEL_KEY,
};



/** populates only the first item with media, but also the total items count */
const UserGalleriesPopulate = [
  {
    path: GALLERY_ITEMS_VIRTUAL,
    match: { 
      itemType: { 
        $in: [GalleryItemTypes.BlockchainAsset, GalleryItemTypes.UserAsset] 
      } 
    },
    options: { 
      limit: 1,
      sort: { "position.1": 1, "position.0": 1 }
    }
  },
  {
    path: GALLERY_TOTAL_ITEMS_VIRTUAL
  }
]
export const UserCreatedGalleriesVirtual = {
  path: USER_CREATED_GALLERIES_VIRTUAL,
  model: GALLERY_MODEL_KEY,
  populate: UserGalleriesPopulate
};

export const UserCollectedGalleriesVirtual = {
  path: USER_COLLECTED_GALLERIES_VIRTUAL,
  model: GALLERY_MODEL_KEY,
  populate: UserGalleriesPopulate,
};

export const CompleteUserVirtuals = [
  WalletUserVirtual,
  CreatedTimelineUserVirtual,
  CollectedTimelineUserVirtual,
  AuthUserVirtual,
  UserCreatedGalleriesVirtual,
  UserCollectedGalleriesVirtual,
];

export const PublicUserVirtuals = [
  CreatedTimelineUserVirtual,
  CollectedTimelineUserVirtual,
];

// Collation settings for case-insensitive username queries
export const UsernameCollation = {
  locale: "en_US",
  strength: 2,
  normalization: true,
};

const User: Model<UserDocument> =
  mongoose.models[USER_MODEL_KEY] ||
  mongoose.model<UserDocument>(USER_MODEL_KEY, UserSchema);

export default User;
