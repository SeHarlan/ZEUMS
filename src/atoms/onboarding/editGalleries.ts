import { createOnboardingAtoms } from "./factory";

export const GalleriesOnboardingKeys = {
  ChooseSource: "chooseSource",
  CreateGallery: "createGallery",
} as const;

export const GALLERIES_ONBOARDING_STORAGE_KEY = "zeumsGalleriesOnboarding";

export const galleriesOnboardingAtoms = createOnboardingAtoms(
  GALLERIES_ONBOARDING_STORAGE_KEY,
  GalleriesOnboardingKeys
);

export const useGalleriesSetter = galleriesOnboardingAtoms.useStepSetter;
