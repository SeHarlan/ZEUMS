import {
  addTimelineEntriesFormOpenAtom,
  rearrangeEntriesDrawerOpenAtom
} from "@/atoms/dashboard";
import { galleryOnboardingAtoms, GalleryOnboardingKeys } from "@/atoms/onboarding/editGallery";
import { INITIALIZED_KEY } from "@/atoms/onboarding/onboardingStages";
import { useAtomValue } from "jotai";
import { OnboardingPopover } from "./OnboardingPopover";

export const GalleryOnboardingPopover = () => {
  const addItemsOpen = useAtomValue(addTimelineEntriesFormOpenAtom);
  const rearrangeItemsOpen = useAtomValue(rearrangeEntriesDrawerOpenAtom);

  const pause = addItemsOpen || rearrangeItemsOpen;

  return (
    <OnboardingPopover
      atom={galleryOnboardingAtoms.stepAtom}
      pause={pause}
      steps={{
        [INITIALIZED_KEY]: {
          content: {
            title: `Welcome to your Gallery editor!`,
            description: "",
            body: (
              <div>
                <ul className="pl-4 mt-2 list-disc mb-2">
                  <li>
                    <strong>Add Items: </strong>
                    Add all your related artworks, as well as text to add context.
                  </li>
                  <li>
                    <strong>Edit Profile: </strong>
                    manage your public profile and choose your primary timeline.
                  </li>
                  <li>
                    <strong>Rearrange: </strong>
                    easily reposition your items to get the most cohesive flow.
                  </li>
                </ul>
              </div>
            ),
          },
        },
        [GalleryOnboardingKeys.AddItems]: {
          content: {
            title: "Add items to your gallery",
            description: "Add items to your gallery to get started.",
          },
        },
        [GalleryOnboardingKeys.RearrangeItems]: {
          content: {
            title: "Rearrange your items",
            description: "Rearrange your items to get started.",
          },
        },
        [GalleryOnboardingKeys.EditSettings]: {
          content: {
            title: "Edit your settings",
            description: "Edit your settings to get started.",
          },
        },
        [GalleryOnboardingKeys.PersonalizeSettings]: {
          content: {
            title: "Personalize your settings",
            description: "Personalize your settings to get started.",
          },
        },
        [GalleryOnboardingKeys.LinkInYourGallery]: {
          content: {
            title: "Link your gallery",
            description: "Link your gallery to get started.",
          },
        },
      }}
    />
  );
};
