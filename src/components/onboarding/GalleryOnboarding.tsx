"use client";

import {
  newGalleryItemFormOpenAtom,
  rearrangeGalleryItemsDrawerOpenAtom
} from "@/atoms/dashboard";
import { galleryOnboardingAtoms, GalleryOnboardingKeys } from "@/atoms/onboarding/editGallery";
import { INITIALIZED_KEY } from "@/atoms/onboarding/onboardingStages";
import { useEditGallerySettings } from "@/context/EditGallerySettingsProvider";
import { TITLE_COPY } from "@/textCopy/mainCopy";
import { useAtomValue } from "jotai";
import { MessageCircleQuestionIcon } from "lucide-react";
import { SupportLinks } from "../navigation/SupportDialog";
import { P } from "../typography/Typography";
import { OnboardingPopover } from "./OnboardingPopover";

export const GalleryOnboardingPopover = () => {
  const addItemsOpen = useAtomValue(newGalleryItemFormOpenAtom);
  const rearrangeItemsOpen = useAtomValue(rearrangeGalleryItemsDrawerOpenAtom);
  const { editingGallery } = useEditGallerySettings();
  const editSettingsOpen = Boolean(editingGallery);
  
  const pause = addItemsOpen || rearrangeItemsOpen || editSettingsOpen;

  return (
    <OnboardingPopover
      atom={galleryOnboardingAtoms.stepAtom}
      pause={pause}
      steps={{
        [INITIALIZED_KEY]: {
          content: {
            title: "Welcome to the Gallery editor!",
            description:
              "Curate a collection and customize the page to perfectly showcase your artwork.",
            body: (
              <div>
                <ul className="pl-4 mt-2 list-disc mb-2">
                  <li>
                    <strong>Add Items: </strong>
                    import related artworks and add text for context.
                  </li>
                  <li>
                    <strong>Edit Settings: </strong>
                    fine-tune and personalize your gallery.
                    <br />
                    <span className="text-muted-foreground text-sm">
                      More customization options coming soon.
                    </span>
                  </li>
                  <li>
                    <strong>Rearrange Items: </strong>
                    drag and drop your items inside an ultra flexible grid to get
                    the exact layout you want.
                  </li>
                </ul>
              </div>
            ),
          },
        },
        [GalleryOnboardingKeys.AddItems]: {
          content: {
            title: "Add items to your gallery",
            description:
              "Add artworks, media, and text blocks — the building blocks of your gallery.",
          },
        },
        [GalleryOnboardingKeys.EditSettings]: {
          content: {
            title: "Edit your settings",
            description: "Add a banner image and customize your gallery.",
          },
        },
        [GalleryOnboardingKeys.RearrangeItems]: {
          content: {
            title: "Rearrange your items",
            description:
              "Design a unique visual flow. Drag and drop your items into flexible rows that adapt to various aspect ratios.",
          },
        },
        [GalleryOnboardingKeys.Support]: {
          content: {
            title: `Thank you for joining ${TITLE_COPY}! We can't wait to see what you create.`,
            description:
              "Questions or feedback? Reach out on X (Twitter) or join our Telegram.",
            body: (
              <div className="space-y-2">
                <SupportLinks buttonVariantOverride="link" />
                <P className="text-center text-muted-foreground text-sm px-8">
                  *You can find these links anytime by clicking the{" "}
                  <MessageCircleQuestionIcon className="inline-block size-4" />{" "}
                  icon in the top-right corner.
                </P>
              </div>
            ),
          },
        },
      }}
    />
  );
};
