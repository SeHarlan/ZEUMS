import { USER_AUTH_VIRTUAL, USER_COLLECTED_GALLERIES_VIRTUAL, USER_COLLECTED_TIMELINE_VIRTUAL, USER_CREATED_GALLERIES_VIRTUAL, USER_CREATED_TIMELINE_VIRTUAL, USER_WALLET_VIRTUAL } from "@/constants/databaseKeys";
import { TimelineEntry } from "./entry";
import { WalletType } from "./wallet";
import { Schema } from "mongoose";
import { AuthUserType } from "./next-auth";
import { ImageType } from "./media";
import { EditTimelineTab } from "./ui/dashboard";
import { GalleryType } from "./gallery";

// export type Website = {
//   url: string;
//   name: string;
//   image: ImageType;
// };

export type BaseUserType = {
  _id: Schema.Types.ObjectId;
  username: string;
  displayName?: string;
  profileImage?: ImageType; 
  bannerImage?: ImageType;
  email?: string;
  bio?: string;
  socialHandles: UserSocialHandles;
  authUserId?: Schema.Types.ObjectId;
  primaryTimeline?: EditTimelineTab;
  // websites?: Website[];
};

export const SOCIAL_HANDLE_KEYS = [
  "x",
  "instagram",
  "tiktok",
  "telegram",
  "discord",
  "website",
  // "facebook",
] as const;

// Define the type based on that const
export type UserSocialHandles = {
  [K in (typeof SOCIAL_HANDLE_KEYS)[number]]?: string;
};

// Type guard uses the same constant
export function isValidSocialHandleKey(
  key: string
): key is keyof UserSocialHandles {
  return SOCIAL_HANDLE_KEYS.includes(key as (typeof SOCIAL_HANDLE_KEYS)[number]);
}

/** extend UserType with virtuals populated */
export type UserType = BaseUserType & {
  [USER_WALLET_VIRTUAL]: WalletType[];
  [USER_CREATED_TIMELINE_VIRTUAL]: TimelineEntry[]; 
  [USER_COLLECTED_TIMELINE_VIRTUAL]: TimelineEntry[]; 
  [USER_AUTH_VIRTUAL]: AuthUserType;
  [USER_CREATED_GALLERIES_VIRTUAL]: GalleryType[];
  [USER_COLLECTED_GALLERIES_VIRTUAL]: GalleryType[];
};

export type PublicUserType = BaseUserType & {
  [USER_CREATED_TIMELINE_VIRTUAL]: TimelineEntry[]; 
  [USER_COLLECTED_TIMELINE_VIRTUAL]: TimelineEntry[]; 
};

export type CreateUserData = {
  username: string;
  email?: string;
  authUserId?: string;
};

// used to get for display name fallback
export type DisplayNameFields = Pick<UserType, 'username' | 'displayName'>;
