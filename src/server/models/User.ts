import { AUTH_USER_MODEL_KEY, ENTRY_FOREIGN_KEY, ENTRY_MODEL_KEY, USER_AUTH_FOREIGN_KEY, USER_AUTH_VIRTUAL, USER_COLLECTED_TIMELINE_VIRTUAL, USER_CREATED_TIMELINE_VIRTUAL, USER_MODEL_KEY, USER_WALLET_VIRTUAL, WALLET_FOREIGN_KEY, WALLET_MODEL_KEY } from "@/constants/databaseKeys";
import { EntrySource } from "@/types/entry";
import { UserType} from "@/types/user";
import mongoose, { Document, Model, Schema } from "mongoose";

export interface UserDocument extends Document, UserType {
  _id: Schema.Types.ObjectId;
}

const UserSchema: Schema = new Schema<UserDocument>(
  {
    username: { type: String, required: true, unique: true, minlength: 3 },
    displayName: { type: String },
    email: { type: String, unique: true, sparse: true },
    bio: { type: String },
    socialHandles: {
      x: { type: String },
      instagram: { type: String },
      tiktok: { type: String },
      facebook: { type: String },
      telegram: { type: String },
      discord: { type: String },
    },
    [USER_AUTH_FOREIGN_KEY]: {
      type: Schema.Types.ObjectId,
      ref: AUTH_USER_MODEL_KEY,
      required: false,
      unique: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }, // Include virtuals in JSON output
    toObject: { virtuals: true }, // Include virtuals in object output
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
  match: { source: EntrySource.Creator}
});
UserSchema.virtual(USER_COLLECTED_TIMELINE_VIRTUAL, {
  ref: ENTRY_MODEL_KEY,
  localField: "_id",
  foreignField: ENTRY_FOREIGN_KEY,
  match: { source: EntrySource.Collector},
});

// virtual for the auth user (next-auth)
UserSchema.virtual(USER_AUTH_VIRTUAL, {
  ref: AUTH_USER_MODEL_KEY,
  localField: USER_AUTH_FOREIGN_KEY,
  foreignField: "_id",
  justOne: true,
});

export const WalletUserVirtual = { path: USER_WALLET_VIRTUAL, model: WALLET_MODEL_KEY };
export const CreatedTimelineUserVirtual = { path: USER_CREATED_TIMELINE_VIRTUAL, model: ENTRY_MODEL_KEY, options: { sort: { date: "descending" } } };
export const CollectedTimelineUserVirtual = { path: USER_COLLECTED_TIMELINE_VIRTUAL, model: ENTRY_MODEL_KEY, options: { sort: { date: "descending" } } };
export const AuthUserVirtual = { path: USER_AUTH_VIRTUAL, model: AUTH_USER_MODEL_KEY };

export const CompleteUserVirtuals = [
  WalletUserVirtual,
  CreatedTimelineUserVirtual,
  CollectedTimelineUserVirtual,
  AuthUserVirtual,
];

const User: Model<UserDocument> =
  mongoose.models[USER_MODEL_KEY] ||
  mongoose.model<UserDocument>(USER_MODEL_KEY, UserSchema);

export default User;