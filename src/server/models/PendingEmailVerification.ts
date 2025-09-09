import { PendingEmailVerificationType } from "@/types/next-auth";
import mongoose, { Document, Model, Schema } from "mongoose";

export interface PendingEmailVerificationDocument extends Document, PendingEmailVerificationType {
  _id: Schema.Types.ObjectId;
}

const PendingEmailVerificationSchema =
  new Schema<PendingEmailVerificationDocument>(
    {
      userId: { type: String, required: true, unique: true, index: true },
      email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
      expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      }, 
    },
    {
      timestamps: true,
      versionKey: false,
    }
  );

// Ensure only one active pending verification per (userId, email)
PendingEmailVerificationSchema.index({ userId: 1, email: 1 }, { unique: true });

// TTL: MongoDB deletes after expiresAt passes
PendingEmailVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });


const PendingEmailVerification: Model<PendingEmailVerificationDocument> =
  mongoose.models.PendingEmailVerification ||
  mongoose.model<PendingEmailVerificationDocument>(
    "PendingEmailVerification",
    PendingEmailVerificationSchema
  );

export default PendingEmailVerification;
