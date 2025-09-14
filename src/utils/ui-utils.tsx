import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {
  DiscordIcon,
  InstagramIcon,
  TelegramIcon,
  TikTokIcon,
  TwitterIcon,
} from "@/components/icons/Social";
import { UserSocialHandles } from "@/types/user";
import { ReactNode } from "react";
import { SocialIconProps } from "@/types/generic";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs))
}

export const MAX_USERNAME_LENGTH = 32
const SECTION_LENGTH = 4

export function truncate(
  text?: string,
  maxLength = MAX_USERNAME_LENGTH,
  sectionLength = SECTION_LENGTH
) {
  if (!text) return "";
  if (text.length < maxLength) return text;

  // Assume it's a wallet address and only return the first and last 4 characters
  const first = text.slice(0, sectionLength);
  const last = text.slice(-sectionLength);
  return `${first}...${last}`;
}

export const socialHandlesList: {
  key: keyof UserSocialHandles;
  label: string;
  baseUrl: string;
  placeholder?: string;
  Icon: (props: SocialIconProps) => ReactNode;
}[] = [
  {
    key: "x",
    label: "X (Twitter)",
    baseUrl: "x.com/",
    Icon: TwitterIcon,
  },
  {
    key: "instagram",
    label: "Instagram",
    baseUrl: "instagram.com/",
    Icon: InstagramIcon,
  },
  {
    key: "tiktok",
    label: "TikTok",
    baseUrl: "tiktok.com/@",
    Icon: TikTokIcon,
  },
  {
    key: "telegram",
    label: "Telegram",
    baseUrl: "telegram.me/",
    Icon: TelegramIcon,
  },
  {
    key: "discord",
    label: "Discord Invite",
    baseUrl: "discord.gg/",
    placeholder: "invite-code",
    Icon: DiscordIcon,
  },
];

