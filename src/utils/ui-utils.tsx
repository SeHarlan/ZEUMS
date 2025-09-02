import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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

