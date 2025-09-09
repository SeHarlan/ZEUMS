import { AUTH_USER_COLLECTION_NAME, AUTH_USER_MODEL_KEY } from "@/constants/databaseKeys";
import { AuthUserType } from "@/types/next-auth";
import mongoose, { Document, Model, Schema } from "mongoose";

export interface AuthUserDocument extends Document, AuthUserType {
  _id: Schema.Types.ObjectId;
}

const AuthUserSchema = new Schema<AuthUserDocument>(
  {
    email: { type: String, required: true, unique: true },
    name: String,
    emailVerified: Date,
  },
  {
    // Match the NextAuth collection name 
    collection: AUTH_USER_COLLECTION_NAME,
  }
);

const AuthUser: Model<AuthUserDocument> =
  mongoose.models[AUTH_USER_MODEL_KEY] ||
  mongoose.model<AuthUserDocument>(AUTH_USER_MODEL_KEY, AuthUserSchema);

export default AuthUser;
