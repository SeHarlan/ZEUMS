import { createOnboardingAtoms } from "./factory";

export const GalleryOnboardingKeys = {
  "AddItems": "addItems",
  "RearrangeItems": "rearrangeItems",
  "EditSettings": "editSettings",
  "PersonalizeSettings": "personalizeSettings",
  "LinkInYourGallery": "linkInYourGallery",
} as const;

export const GALLERY_ONBOARDING_STORAGE_KEY = "zeumsGalleryOnboarding";

export const galleryOnboardingAtoms = createOnboardingAtoms(
  GALLERY_ONBOARDING_STORAGE_KEY,
  GalleryOnboardingKeys
);

export const useGallerySetter = galleryOnboardingAtoms.useStepSetter;
