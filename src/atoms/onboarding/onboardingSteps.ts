import { Atom, Getter, Setter, WritableAtom } from "jotai";
import { getOnboardingStage, INITIALIZED_KEY, isInitialize, isOnboardingStage, OnboardingAtom, OnboardingStage, OnboardingValue, setOnboardingStage } from "./onboardingStages";


export type OnboardingStepValue<T extends string> = {
  completedSteps: number;
  activeStep: typeof INITIALIZED_KEY | T | null;
  activeIndex: number;
  totalSteps: number;
  activeTriggerElement: HTMLElement | null;
  stage: OnboardingStage;
};

export type OnboardingStepAtom<T extends string> = WritableAtom<
  OnboardingStepValue<T>,
  [newStatus: T | OnboardingStepDirection | OnboardingStage],
  void
>;

type OnboardingStepDirection = "next" | "previous";
const isOnboardingStepDirection = (
  step: string
): step is OnboardingStepDirection => {
  return step === "next" || step === "previous";
};

export const getOnboardingStep = <T extends string>(
  onboarding: OnboardingValue<T>
) => {
  const steps = Object.entries(onboarding) as [typeof INITIALIZED_KEY | T, boolean][];
  const firstCompleted = steps.find(([_, completed]) => !completed);
  return firstCompleted ? firstCompleted[0] : null;
};

export const setMovingStep = <T extends string>(
  onboarding: OnboardingValue<T>,
  stepDirection: OnboardingStepDirection
) => {
  const key = getOnboardingStep(onboarding);
  if (!key) return onboarding;

  switch (stepDirection) {
    case "next": {
      // Complete the current step to move to the next
      return { ...onboarding, [key]: true };
    }
    case "previous": {
      // copy to avoid mutation

      const currentIndex = Object.keys(onboarding).indexOf(key);
      const previousIndex = currentIndex - 1;
      
      if (previousIndex < 0) {
        // already on first step
        return onboarding;
      }

      const previousKey = Object.keys(onboarding)[previousIndex] as T;
      return { ...onboarding, [previousKey]: false };
    }
  }
};

export const onboardingStepGetter =
  <T extends string>(atom: OnboardingAtom<T>, refStore: Record<T, HTMLElement | null>, refTriggerAtom: Atom<number>) =>
  (get: Getter): OnboardingStepValue<T> => {
    const onboarding = get(atom);
    get(refTriggerAtom); // Subscribe to trigger changes
    const activeStep = getOnboardingStep(onboarding)
    const stage = getOnboardingStage(onboarding);
      
    const stepKeys = Object.keys(onboarding);
    const activeIndex = activeStep ? stepKeys.indexOf(activeStep) : -1;
    const activeTriggerElement =
      isInitialize(activeStep) || !activeStep
        ? null
        : refStore[activeStep];

        const totalSteps = stepKeys.length;

    // -1 because the initialize key is not counted as a step
    const completedSteps = Object.values(onboarding).filter(Boolean).length - 1;
    return {
      stage,
      completedSteps,
      activeTriggerElement,
      activeStep,
      activeIndex,
      totalSteps,
    };
  };

export const onboardingStepSetter =
  <T extends string>(atom: OnboardingAtom<T>) =>
  (get: Getter, set: Setter, newStatus: OnboardingStage | OnboardingStepDirection | T) => {
    const onboarding = get(atom);
    let updatedOnboarding: OnboardingValue<T>;
    if (isOnboardingStage(newStatus)) {
      updatedOnboarding = setOnboardingStage(onboarding, newStatus);

    } else if (isOnboardingStepDirection(newStatus)) {
      updatedOnboarding = setMovingStep(onboarding, newStatus);

    } else {
      updatedOnboarding = { ...onboarding, [newStatus]: true };
    }
    set(atom, updatedOnboarding);
  };


  export const basicOnboardingSetter = <T extends string>(atom: OnboardingAtom<T>) =>
  (get: Getter, set: Setter, stepKey: T) => {
    const onboarding = get(atom);
    const activeStep = getOnboardingStep(onboarding);
    //only allow setting to true if this is the active step
    if (stepKey !== activeStep) return;
    const updatedOnboarding = { ...onboarding, [stepKey]: true };
    set(atom, updatedOnboarding);
  };