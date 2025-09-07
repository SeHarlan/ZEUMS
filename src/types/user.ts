import { USER_COLLECTED_TIMELINE_VIRTUAL, USER_CREATED_TIMELINE_VIRTUAL, USER_WALLET_VIRTUAL } from "@/constants/databaseKeys";
import { TimelineEntry } from "./entry";
import { WalletType } from "./wallet";
import type { Account } from "next-auth";

export type BaseUserType = {
  username: string;
  displayName?: string;
  email?: string;
  name?: string; // Required by NextAuth
  image?: string; // Required by NextAuth
  bio?: string;
  socialHandles: UserSocialHandles;
  accounts?: Account[];
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

//extend base with mongoose virtuals
export type UserType = BaseUserType & {
  [USER_WALLET_VIRTUAL]: WalletType[];
  [USER_CREATED_TIMELINE_VIRTUAL]: TimelineEntry[]; 
  [USER_COLLECTED_TIMELINE_VIRTUAL]: TimelineEntry[]; 
};

export type CreateUserData = {
  username: string;
  email?: string;
  name?: string;
  image?: string;
};

// used to get for display name fallback
export type DisplayNameFields = Pick<UserType, 'username' | 'displayName'>;
