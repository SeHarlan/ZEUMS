import { galleriesOnboardingAtoms, GalleriesOnboardingKeys } from "@/atoms/onboarding/editGalleries";
import { INITIALIZED_KEY } from "@/atoms/onboarding/onboardingStages";
import { EditIcon } from "lucide-react";
import { P } from "../typography/Typography";
import { OnboardingPopover } from "./OnboardingPopover";

export const GalleriesOnboardingPopover = () => {
  return (
    <OnboardingPopover
      atom={galleriesOnboardingAtoms.stepAtom}
      steps={{
        [INITIALIZED_KEY]: {
          content: {
            title: "Welcome to Galleries",
            description:
              "Create and manage curated collections where people can explore your art in depth.",
            body: (
              <ul className="list-disc pl-4 text-foreground">
                <li>
                  Choose between <strong>Created</strong> and{" "}
                  <strong>Collected</strong> galleries.
                </li>
                <li>
                  Click the <EditIcon className="size-4 inline-block" /> icon to
                  edit general settings. Click the card to go to its{" "}
                  <strong>gallery editor</strong> page
                </li>
                <P className="text-muted-foreground text-sm text-center pr-4 mt-2">
                  After creating a gallery, add it to your <strong>timeline</strong>{" "}
                  or share it as a<strong> standalone page</strong>.
                </P>
              </ul>
            ),
          },
        },
        [GalleriesOnboardingKeys.ChooseSource]: {
          content: {
            title: "Choose your gallery type",
            body: (
              <P className="text-muted-foreground text-center">
                Like timelines, galleries are organized by source - your own
                work (<strong>Created</strong>) or art you've collected (
                <strong>Collected</strong>).
              </P>
            ),
          },
        },
        [GalleriesOnboardingKeys.CreateGallery]: {
          content: {
            title: "Create a new gallery",
            description:
              "Your selected category determines the gallery type. Once created, you'll be redirected to its editor.",
          },
        },
      }}
    />
  );
};
