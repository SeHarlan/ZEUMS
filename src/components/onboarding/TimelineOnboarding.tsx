import { addTimelineEntriesFormOpenAtom, editProfileFormOpenAtom, rearrangeEntriesDrawerOpenAtom } from "@/atoms/dashboard";
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
            title: `Welcome to your ${TITLE_COPY} timeline editor!`,
            description:
              "Manage your timelines, where people will learn about you, view highlighted artworks and find your galleries.",
            body: (
              <div>
                <ul className="pl-4 mt-2 list-disc mb-2">
                  <li>
                    <strong>Edit Profile: </strong>
                    manage your public profile and choose your primary timeline.
                  </li>
                  <li>
                    <strong>Add Items: </strong>
                    highlight specific artworks, add context with text, and
                    connect to your galleries.
                  </li>
                  <li>
                    <strong>Rearrange: </strong>
                    easily reposition your items to get the most cohesive flow.
                  </li>
                </ul>
                <div className="text-muted-foreground text-center text-sm">
                  <P>
                    <strong>Galleries </strong>
                    are pages dedicated to showcasing entire collections of
                    related artworks. If you would rather create a gallery first{" "}
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
        [TimelineOnboardingKeys.ChooseActiveSource]: {
          content: {
            title: "Choose the timeline you want to edit",
            description:
              "If one of these doesn't apply to you, just leave it empty and it will be removed from the public view.",
          },
        },
        [TimelineOnboardingKeys.EditProfile]: {
          content: {
            title: "Edit your profile",
            description:
              "This is information that applies to all timelines: your profile images, bio, social media links, etc.",
          },
        },
        [TimelineOnboardingKeys.ChoosePrimaryTimeline]: {
          content: {
            title: "Choose your primary timeline",
            description:
              "This will be your default timeline. If you have multiple timelines with content, it will be the first one presented publicly.",
          },
          onPrevious: () => setEditProfileFormOpen(false),
          onActive: () => setEditProfileFormOpen(true),
        },
        [TimelineOnboardingKeys.SaveProfile]: {
          content: {
            title: "Save your profile",
            description:
              "Once you've made changes to your profile, click the button below to save them.",
          },
          onActive: () => setEditProfileFormOpen(true),
          onNext: () => setEditProfileFormOpen(false),
        },
        [TimelineOnboardingKeys.AddItems]: {
          content: {
            title: "Add items to your timeline",
            description:
              "Highlight your favorite artworks, add text to guide viewers through your history, and link to your galleries for a deeper look at your collections.",
          },
        },
        [TimelineOnboardingKeys.RearrangeItems]: {
          content: {
            title: "Rearrange your items",
            description:
              "Change the position of text and the dates of artworks or galleries, which will also determine their order",
          },
        },
        [TimelineOnboardingKeys.goToGalleries]: {
          content: {
            title: "You've completed the timeline overview! Now let's go to your galleries page.",
            description: navigateDescription,
            body: (
              <div className="w-full flex justify-center items-center gap-2 font-medium">
                <P>Manage</P>
                <MoveRightIcon className="size-4 text-muted-foreground" />
                <P>My Galleries</P>
              </div>
            )
          },
        },
      }}
    />
  );
}