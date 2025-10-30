
import { accountOnboardingAtoms, AccountOnboardingKeys } from "@/atoms/onboarding/editAccount";
import { INITIALIZED_KEY } from "@/atoms/onboarding/onboardingStages";
import { useBreakpoints } from "@/context/ResponsiveProvider";
import { TITLE_COPY } from "@/textCopy/mainCopy";
import { MoveRightIcon } from "lucide-react";
import { P } from "../typography/Typography";
import { OnboardingPopover } from "./OnboardingPopover";

export const AccountOnboardingPopover = () => { 
  const { isMd } = useBreakpoints();

  const navigateDescription = isMd
    ? "This arrow button is a shortcut. You can also navigate to the editor from the menu bar at the top of the page."
    : "You can navigate to the editor from menu bar at the top of the page.";
  
  return (
    <OnboardingPopover
      atom={accountOnboardingAtoms.stepAtom}
      steps={{
        [INITIALIZED_KEY]: {
          content: {
            title: `Welcome to ${TITLE_COPY}!`,
            description: `You've completed one of these steps to sign up. Finish the other to unlock the full ${TITLE_COPY} experience.`,
            body: (
              <ul className="list-disc pl-4 text-foreground">
                <li>
                  <strong>Connect your wallets</strong> to display artworks
                  you've created or collected onchain.
                </li>
                <li>
                  <strong>Verify your email</strong> to sign in securely on any
                  device.
                </li>
              </ul>
            ),
          },
        },
        [AccountOnboardingKeys.VerifiedEmail]: {
          content: {
            title: "Verify your email",
            description:
              "Confirm your email to enable secure login on any device.",
          },
        },
        [AccountOnboardingKeys.VerifiedWallets]: {
          content: {
            title: "Connect wallets",
            description:
              "Link your wallets to display the art associated with them.",
          },
        },
        [AccountOnboardingKeys.GoToTimeline]: {
          content: {
            title: "Next, let's explore your timeline editor",
            description: navigateDescription,
            body: (
              <div className="w-full flex justify-center items-center gap-2 font-medium">
                <P>Manage</P>
                <MoveRightIcon className="size-4 text-muted-foreground" />
                <P>My Timeline</P>
              </div>
            ),
          },
        },
      }}
    />
  );
}