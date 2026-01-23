import { UploadCategory } from "@/constants/uploadCategories";

export type ImageVariant = "default" | "profile" | "banner";

export enum MediaOrigin {
  User = "user",
  Blockchain = "blockchain",
}

export type BaseMedia = {
  category: MediaCategory;
  aspectRatio?: number;
};
export enum MediaCategory {
  Image = "image",
  Video = "video",
  Html = "html",
  Vr = "vr",
  Audio = "audio",
}

export enum CdnIdType {
  HELIUS_URL = "helius_image_url",
  VERCEL_BLOB_USER_IMAGE = "vercel_blob_user_image",
}

export interface BlobUrlBuilderProps {
  userId: string;
  category: UploadCategory;
}

export type Cdn = {
  type: CdnIdType;
  cdnId: string;
};

//user media (will always come from upload to CDN)
export type UserImage = BaseMedia & {
  origin: MediaOrigin.User;
  category: MediaCategory.Image;
  imageCdn: Cdn;
};

export type UserMedia = BaseMedia & {
  origin: MediaOrigin.User;
  category: Omit<MediaCategory, MediaCategory.Image>;
  imageCdn: Cdn;
  mediaCdn: Cdn;
};

//blockchain
export type BlockchainImage = BaseMedia & {
  origin: MediaOrigin.Blockchain;
  category: MediaCategory.Image;
  imageUrl: string;
  imageCdn?: Cdn;
};
export type BlockchainMedia = BaseMedia & {
  origin: MediaOrigin.Blockchain;
  category: Omit<MediaCategory, MediaCategory.Image>;
  imageUrl: string;
  imageCdn?: Cdn;
  mediaUrl: string;
  mediaCdn?: Cdn;
};

export type MediaType =
  | UserImage
  | UserMedia
  | BlockchainImage
  | BlockchainMedia;

export type ImageType = UserImage | BlockchainImage;

export type OtherMediaType = UserMedia | BlockchainMedia;

// Type guard functions
export function isImageType(media: MediaType): media is ImageType {
  return media.category === MediaCategory.Image;
}

export function isUserImage(media: MediaType): media is UserImage {
  return (
    media.origin === MediaOrigin.User && media.category === MediaCategory.Image
  );
}

export function isUserMedia(media: MediaType): media is UserMedia {
  return (
    media.origin === MediaOrigin.User && media.category !== MediaCategory.Image
  );
}

export function isBlockchainImage(media: MediaType): media is BlockchainImage {
  return (
    media.origin === MediaOrigin.Blockchain &&
    media.category === MediaCategory.Image
  );
}

export function isBlockchainMedia(media: MediaType): media is BlockchainMedia {
  return (
    media.origin === MediaOrigin.Blockchain &&
    media.category !== MediaCategory.Image
  );
}

// media type resolver
export function getMediaType(
  media: MediaType
): UserImage | UserMedia | BlockchainImage | BlockchainMedia {
  if (isUserImage(media)) return media;
  if (isUserMedia(media)) return media;
  if (isBlockchainImage(media)) return media;
  if (isBlockchainMedia(media)) return media;

  // should be unreachable
  throw new Error("Invalid media type combination") as never;
}
