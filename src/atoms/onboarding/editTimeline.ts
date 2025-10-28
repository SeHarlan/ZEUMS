import { createOnboardingAtoms } from "./factory";

export const TimelineOnboardingKeys = {
  ChooseActiveSource: "chooseActiveSource",
  EditProfile: "editProfile",
  ChoosePrimaryTimeline: "choosePrimaryTimeline",
  SaveProfile: "saveProfile",
  AddItems: "addItems",
  RearrangeItems: "rearrangeItems",
  goToGalleries: "goToGalleries",
} as const;

export const TIMELINE_ONBOARDING_STORAGE_KEY = "zeumsTimelineOnboarding";

export const timelineOnboardingAtoms = createOnboardingAtoms(
  TIMELINE_ONBOARDING_STORAGE_KEY,
  TimelineOnboardingKeys
);

export const useTimelineSetter = timelineOnboardingAtoms.useStepSetter;