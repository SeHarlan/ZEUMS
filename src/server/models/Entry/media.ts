import { MediaOrigin, MediaCategory, BaseMedia, Cdn, CdnIdType } from "@/types/media";
import { Schema, Document } from "mongoose";

interface MediaDocument extends BaseMedia, Document {
  origin: MediaOrigin;
  category: MediaCategory;
  imageCdn?: Cdn
  imageUrl?: string;
  mediaCdn?: Cdn;
  mediaUrl?: string;
}

// CDN Schema
const CdnSchema = new Schema<Cdn>(
  {
    type: {
      type: String,
      enum: Object.values(CdnIdType),
      required: true,
    },
    cdnId: {
      type: String,
      required: true,
    },
  },
  { _id: false } // _id: false is important when embedding
);

// Create a media schema that can be embedded in other schemas
export const MediaSchema = new Schema<MediaDocument>(
  {
    // Common fields 
    category: {
      type: String,
      enum: Object.values(MediaCategory),
      required: true,
    },
    aspectRatio: {
      type: Number,
      required: true,
    },
    origin: {
      type: String,
      enum: Object.values(MediaOrigin),
      required: true,
    },

    // Optional fields based on media type
    //user image + user media
    imageCdn: {
      type: CdnSchema,
      required: function (this) {
        return (
          this.origin === MediaOrigin.User
        );
      },
    },

    //blockchain image + blockchain media
    imageUrl: {
      type: String,
      required: function (this) {
        return this.origin === MediaOrigin.Blockchain;
      },
    },

    //user media
    mediaCdn: {
      type: CdnSchema,
      required: function (this) {
        return (
          this.origin === MediaOrigin.User &&
          this.category !== MediaCategory.Image
        );
      },
    },

    //blockchain media
    mediaUrl: {
      type: String,
      required: function (this) {
        return (
          this.origin === MediaOrigin.Blockchain &&
          this.category !== MediaCategory.Image
        );
      },
    },
  },
  { _id: false }
);
