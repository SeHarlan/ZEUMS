import { createOnboardingAtoms } from "./factory";


export const AccountOnboardingKeys = {
  VerifiedEmail: "verifiedEmail",
  VerifiedWallets: "verifiedWallets",
  GoToTimeline: "goToTimeline",
} as const;

export const ACCOUNT_ONBOARDING_STORAGE_KEY = "zeumsAccountOnboarding";

export const accountOnboardingAtoms = createOnboardingAtoms(
  ACCOUNT_ONBOARDING_STORAGE_KEY,
  AccountOnboardingKeys
);

export const useAccountSetter = accountOnboardingAtoms.useStepSetter;
