import { ACCOUNT_ONBOARDING_STORAGE_KEY } from "@/atoms/onboarding/editAccount";
import { GALLERIES_ONBOARDING_STORAGE_KEY } from "@/atoms/onboarding/editGalleries";
import { GALLERY_ONBOARDING_STORAGE_KEY } from "@/atoms/onboarding/editGallery";
import { TIMELINE_ONBOARDING_STORAGE_KEY } from "@/atoms/onboarding/editTimeline";

/**
 * Clear specific localStorage keys
 * @param keys - Array of keys to clear from localStorage
 */
export function clearStorageKeys(keys: string[]): void {
  keys.forEach(key => {
    localStorage.removeItem(key);
  });
}

/**
 * Clear all onboarding-related storage keys
 */
export function clearOnboardingStorage(): void {
  clearStorageKeys([
    ACCOUNT_ONBOARDING_STORAGE_KEY,
    TIMELINE_ONBOARDING_STORAGE_KEY,
    GALLERIES_ONBOARDING_STORAGE_KEY,
    GALLERY_ONBOARDING_STORAGE_KEY,
  ]);
}
