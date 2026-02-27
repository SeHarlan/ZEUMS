import {
  addTimelineEntriesFormOpenAtom,
  editProfileFormOpenAtom,
  editTimelineSettingsFormOpenAtom,
  rearrangeEntriesDrawerOpenAtom,
} from "@/atoms/dashboard";
import { timelineOnboardingAtoms, TimelineOnboardingKeys } from "@/atoms/onboarding/editTimeline";
import { INITIALIZED_KEY } from "@/atoms/onboarding/onboardingStages";
import { EDIT_GALLERIES } from "@/constants/clientRoutes";
import { useBreakpoints } from "@/context/ResponsiveProvider";
import { TITLE_COPY } from "@/textCopy/mainCopy";
import { useAtomValue, useSetAtom } from "jotai";
import { MoveRightIcon } from "lucide-react";
import Link from "next/link";
import { P } from "../typography/Typography";
import { OnboardingPopover } from "./OnboardingPopover";

export const TimelineOnboardingPopover = () => {
  const { isMd } = useBreakpoints();
  const setEditProfileFormOpen = useSetAtom(editProfileFormOpenAtom);
  const setEditTimelineSettingsFormOpen = useSetAtom(
    editTimelineSettingsFormOpenAtom
  );
  const addItemsOpen = useAtomValue(addTimelineEntriesFormOpenAtom);
  const rearrangeItemsOpen = useAtomValue(rearrangeEntriesDrawerOpenAtom);

  const pause = addItemsOpen || rearrangeItemsOpen;


  const navigateDescription = isMd
    ? "This arrow button is a shortcut. You can also navigate to your galleries from the menu bar at the top of the page"
    : "You can navigate to your galleries from menu bar at the top of the page";


  return (
    <OnboardingPopover
      atom={timelineOnboardingAtoms.stepAtom}
      pause={pause}
      steps={{
        [INITIALIZED_KEY]: {
          content: {
            title: `Welcome to your ${TITLE_COPY} Timeline editor!`,
            description: `This timeline is your homepage, the entryway into your creative world. 
              Introduce yourself, highlight favorite artworks, and connect your galleries.`,
            body: (
              <div>
                <ul className="pl-4 mt-2 list-disc mb-2">
                  <li>
                    <strong>Edit Profile: </strong>
                    manage your public profile details like images, bio, and
                    social links.
                  </li>
                  <li>
                    <strong>Edit Settings: </strong>
                    choose your primary timeline and adjust date visibility.
                  </li>
                  <li>
                    <strong>Add Items: </strong>
                    highlight specific artworks, add context with text, and
                    connect your galleries.
                  </li>
                  <li>
                    <strong>Rearrange: </strong>
                    easily reposition your items to get the most natural flow.
                  </li>
                </ul>
                <div className="text-muted-foreground text-center text-sm">
                  <P>
                    <strong>Galleries </strong>
                    are pages dedicated to showcasing different collections. If
                    you would rather create a gallery first{" "}
                    <Link href={EDIT_GALLERIES} className="underline">
                      click here
                    </Link>
                    .
                  </P>
                </div>
              </div>
            ),
          },
        },
        [TimelineOnboardingKeys.EditProfile]: {
          content: {
            title: "Edit your profile",
            description:
              "Update details that appear across timelines like your profile image, bio, and social links.",
          },
        },
        [TimelineOnboardingKeys.SaveProfile]: {
          content: {
            title: "Save your profile",
            description:
              "Once you've made updates, click this button to save your changes.",
          },
          onActive: () => {
            setEditTimelineSettingsFormOpen(false);
            setEditProfileFormOpen(true);
          },
          onNext: () => setEditProfileFormOpen(false),
        },
        [TimelineOnboardingKeys.ChooseActiveSource]: {
          content: {
            title: "Choose the timeline you want to edit",
            body: (
              <div className="space-y-2">
                <P className="text-muted-foreground text-center">
                  Your timelines are separated by source. Work you've made (
                  <strong>Created</strong>) or artwork you own (
                  <strong>Collected</strong>).
                </P>
                <P className="text-muted-foreground text-center text-sm">
                  *If one doesn't apply, leave it empty and it won't appear
                  publicly.
                </P>
              </div>
            ),
          },
        },
        [TimelineOnboardingKeys.EditSettings]: {
          content: {
            title: "Edit your settings",
            description:
              "Choose your primary timeline and adjust how dates are displayed.",
          },
        },
        [TimelineOnboardingKeys.ChoosePrimaryTimeline]: {
          content: {
            title: "Choose your primary timeline",
            description:
              "If you have multiple timelines, this will be the first one visitors see when they go to your homepage.",
          },
          onPrevious: () => setEditTimelineSettingsFormOpen(false),
          onActive: () => setEditTimelineSettingsFormOpen(true),
        },

        [TimelineOnboardingKeys.AddItems]: {
          content: {
            title: "Add items to your timeline",
            description:
              "Showcase artworks, add context with text, and connect galleries for a deeper look at your collections.",
          },
        },
        [TimelineOnboardingKeys.RearrangeItems]: {
          content: {
            title: "Rearrange your items",
            description:
              "Adjust the order of artworks and text to shape the visual flow of your timeline.",
            body: (
              <P className="text-muted-foreground text-sm text-center">
                *Item dates will change automatically to match their new
                position.
              </P>
            ),
          },
        },
        [TimelineOnboardingKeys.goToGalleries]: {
          content: {
            title: "Your galleries page is next",
            description: navigateDescription,
            body: (
              <div className="w-full flex justify-center items-center gap-2 font-medium">
                <P>Manage</P>
                <MoveRightIcon className="size-4 text-muted-foreground" />
                <P>My Galleries</P>
              </div>
            ),
          },
        },
      }}
    />
  );
}