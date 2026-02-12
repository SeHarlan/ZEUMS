import { createOnboardingAtoms } from "./factory";

export const TimelineOnboardingKeys = {
  EditProfile: "editProfile",
  SaveProfile: "saveProfile",
  ChooseActiveSource: "chooseActiveSource",
  EditSettings: "editSettings",
  ChoosePrimaryTimeline: "choosePrimaryTimeline",
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