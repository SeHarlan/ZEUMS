import { galleriesOnboardingAtoms, GalleriesOnboardingKeys } from "@/atoms/onboarding/editGalleries";
import { INITIALIZED_KEY } from "@/atoms/onboarding/onboardingStages";
import { OnboardingPopover } from "./OnboardingPopover";

export const GalleriesOnboardingPopover = () => {
  return (
    <OnboardingPopover
      atom={galleriesOnboardingAtoms.stepAtom}
      steps={{
        [INITIALIZED_KEY]: {
          content: {
            title: `Welcome to your Galleries Management Page!`,
            description: `Create and edit your galleries settings. These are curated collections where viewers can explore your art in depth.`,
            body: (
              <ul className="list-disc pl-4 text-foreground">
                <li>
                  Choose between your <strong>Created</strong> or{" "}
                  <strong>Collected</strong> galleries
                </li>
                <li>
                  Once you've created one, add it to your{" "}
                  <strong>timeline</strong> or share it as a{" "}
                  <strong>standalone page</strong>.
                </li>
              </ul>
            ),
          },
        },
        [GalleriesOnboardingKeys.ChooseSource]: {
          content: {
            title: "Choose your gallery type",
            description:
              "Similar to timelines, galleries are categorized by their content's source."
          },
        },
        [GalleriesOnboardingKeys.CreateGallery]: {
          content: {
            title: "Create a new gallery",
            description: "The type will be based on the category you chose in the previous step.",
          },
        },
      }}
    />
  );
};
