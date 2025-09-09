import { USER_AUTH_VIRTUAL, USER_COLLECTED_TIMELINE_VIRTUAL, USER_CREATED_TIMELINE_VIRTUAL, USER_WALLET_VIRTUAL } from "@/constants/databaseKeys";
import { TimelineEntry } from "./entry";
import { WalletType } from "./wallet";
import { Schema } from "mongoose";
import { AuthUserType } from "./next-auth";

export type BaseUserType = {
  _id: Schema.Types.ObjectId;
  username: string;
  displayName?: string;
  email?: string;
  name?: string; // Required by NextAuth
  image?: string; // Required by NextAuth
  bio?: string;
  socialHandles: UserSocialHandles;
  authUserId?: Schema.Types.ObjectId;
};

export const SOCIAL_HANDLE_KEYS = [
  "x",
  "instagram",
  "tiktok",
  "facebook",
  "telegram",
  "discord",
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
};

export type CreateUserData = {
  username: string;
  email?: string;
  authUserId?: string;
};

// used to get for display name fallback
export type DisplayNameFields = Pick<UserType, 'username' | 'displayName'>;
