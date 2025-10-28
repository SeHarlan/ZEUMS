import { Getter, Setter, WritableAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const INITIALIZED_KEY = "initialize" as const;
export const isInitialize = (key: unknown): key is typeof INITIALIZED_KEY => {
  return key === INITIALIZED_KEY;
};

export type OnboardingValue<T extends string> = {
  [INITIALIZED_KEY]: boolean;
} & Record<T, boolean>;

export type OnboardingAtom<T extends string> = WritableAtom<
  OnboardingValue<T>,
  [OnboardingValue<T>],
  void
  >;

export const createOnboardingAtom = <T extends string>(storageKey: string, initialValue: Record<T, boolean>) => { 
  return atomWithStorage<OnboardingValue<T>>(storageKey, {
    [INITIALIZED_KEY]: false,
    ...initialValue
  });
};

export type OnboardingStage = "notStarted" | "inProgress" | "complete";

export const isOnboardingStage = (stage: unknown): stage is OnboardingStage => {
  return stage === "notStarted" || stage === "inProgress" || stage === "complete";
};  
export const getOnboardingStage = <T extends string>(
  onboarding: OnboardingValue<T>
): OnboardingStage => {
  if (!onboarding[INITIALIZED_KEY]) return "notStarted";  
  if(Object.values(onboarding).some(value => !value)) return "inProgress";
  return "complete";
};

export const setOnboardingStage = <T extends string>(
  onboarding: OnboardingValue<T>,
  newStatus: OnboardingStage
) => {
  if (newStatus === "inProgress") return {
    ...onboarding,
    [INITIALIZED_KEY]: true,
  }

  let newValue: boolean;
  if (newStatus === "complete") newValue = true;
  if (newStatus === "notStarted") newValue = false;

  return Object.fromEntries(
    Object.keys(onboarding).map((key) => [key, newValue])
  ) as typeof onboarding;
};

export const onboardingStageGetter =
  <T extends string>(atom: OnboardingAtom<T>) =>
  (get: Getter) => {
    const onboarding = get(atom);
    return getOnboardingStage(onboarding);
    };
  
export const onboardingStageSetter =
  <T extends string>(atom: OnboardingAtom<T>) =>
  (get: Getter, set: Setter, newStatus: OnboardingStage) => {
    const onboarding = get(atom);
    const updatedOnboarding = setOnboardingStage(onboarding, newStatus);
    set(atom, updatedOnboarding);
  };
