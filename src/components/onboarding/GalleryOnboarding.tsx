import {
  newGalleryItemFormOpenAtom,
  rearrangeGalleryItemsDrawerOpenAtom
} from "@/atoms/dashboard";
import { galleryOnboardingAtoms, GalleryOnboardingKeys } from "@/atoms/onboarding/editGallery";
import { INITIALIZED_KEY } from "@/atoms/onboarding/onboardingStages";
import { EDIT_TIMELINE } from "@/constants/clientRoutes";
import { useEditGallerySettings } from "@/context/EditGallerySettingsProvider";
import { TITLE_COPY } from "@/textCopy/mainCopy";
import { getReturnKey, makeReturnQueryParam } from "@/utils/navigation";
import { useAtomValue } from "jotai";
import { MessageCircleQuestionIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SupportLinks } from "../navigation/SupportDialog";
import { P } from "../typography/Typography";
import { OnboardingPopover } from "./OnboardingPopover";

export const GalleryOnboardingPopover = () => {
  const addItemsOpen = useAtomValue(newGalleryItemFormOpenAtom);
  const rearrangeItemsOpen = useAtomValue(rearrangeGalleryItemsDrawerOpenAtom);
  const pathname = usePathname();
  const { editingGallery } = useEditGallerySettings();
  const editSettingsOpen = Boolean(editingGallery);
  
  const pause = addItemsOpen || rearrangeItemsOpen || editSettingsOpen;

  const returnKey = getReturnKey(pathname);
  const timelineUrl = EDIT_TIMELINE + makeReturnQueryParam(returnKey);


  return (
    <OnboardingPopover
      atom={galleryOnboardingAtoms.stepAtom}
      pause={pause}
      steps={{
        [INITIALIZED_KEY]: {
          content: {
            title: "Welcome to your Gallery editor!",
            description:
              "Manage your gallery, where you can exhibit an entire collection in a customizable space.",
            body: (
              <div>
                <ul className="pl-4 mt-2 list-disc mb-2">
                  <li>
                    <strong>Add Items: </strong>
                    showcase all your related artworks, as well as text for
                    added context.
                  </li>
                  <li>
                    <strong>Edit Settings: </strong>
                    fine tune and personalize your gallery.
                    <br />
                    <span className="text-muted-foreground text-sm">
                      More customization options coming soon!
                    </span>
                  </li>
                  <li>
                    <strong>Rearrange Items: </strong>
                    drag and drop your items into an ultra flexible grid to get
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
              "This is where you'll add the individual elements, media and text blocks that make up your gallery.",
          },
        },
        [GalleryOnboardingKeys.EditSettings]: {
          content: {
            title: "Edit your settings",
            description:
              "Add a banner image and change settings to customize your gallery.",
          },
        },
        [GalleryOnboardingKeys.RearrangeItems]: {
          content: {
            title: "Rearrange your items",
            description:
              "Design a unique layout and flow. Drag and drop your items into flexible rows that adapt the various aspect ratios.",
          },
        },
        [GalleryOnboardingKeys.LinkInYourGallery]: {
          content: {
            title: `That's it for the Gallery overview!`,
            description: "",
            body: (
              <div>
                <P className="text-center space-y-2 text-muted-foreground">
                  Don't forget to link to this gallery in your{" "}
                  <Link href={timelineUrl} className="underline">
                    timeline
                  </Link>
                  !
                </P>
              </div>
            ),
          },
        },
        [GalleryOnboardingKeys.Support]: {
          content: {
            title: `Thank you for joining ${TITLE_COPY}! We can't wait to see what you create here!`,
            description:
              "If you have any questions or feedback, reach out to us on X or join our Telegram channel.",
            body: (
              <div className="space-y-2">
                <SupportLinks buttonVariantOverride="link" />
                <P className="text-center text-muted-foreground text-sm px-8">
                  *You can always find these links later by clicking the{" "}
                  <MessageCircleQuestionIcon className="inline-block size-4" /> icon in
                  the top right corner of the screen.
                </P>
              </div>
            ),
          },
        },
      }}
    />
  );
};
