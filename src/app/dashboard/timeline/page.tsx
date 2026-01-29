"use client";
import { TimelineOnboardingKeys, useTimelineSetter } from "@/atoms/onboarding/editTimeline";
import EditTimeline from "@/components/dashboard/editTimeline/EditTimeline";
import { PageTurnLeft, PageTurnRight } from "@/components/dashboard/PageTurnButtons";
import { PageContainer } from "@/components/general/PageContainer";
import { TimelineOnboardingPopover } from "@/components/onboarding/TimelineOnboarding";
import ProfileHero from "@/components/timeline/ProfileHero";
import { TimelineBackground } from "@/components/timeline/TimelineBackground";
import { P } from "@/components/typography/Typography";
import { LinkButton } from "@/components/ui/button";
import { EDIT_GALLERIES, EDIT_PROFILE_ACCOUNT, USER_TIMELINE } from "@/constants/clientRoutes";
import { NavBarActions } from "@/context/NavBarActionsProvider";
import { useUser } from "@/context/UserProvider";
import { EyeIcon } from "lucide-react";

export default function EditTimelinePage() { 
  const { user } = useUser();
  const {setStepComplete, setStepRef} = useTimelineSetter(TimelineOnboardingKeys.goToGalleries);
  return (
    <PageContainer maxWidth="large" noPadding>
      
      <NavBarActions>
        <LinkButton
          href={USER_TIMELINE(user?.username ?? "")}
          variant="outline"
          className="size-10 md:w-fit"
        >
          <EyeIcon className="size-5 md:size-4" />
          <P className="hidden md:block">Public Timeline</P>
        </LinkButton>
      </NavBarActions>

      <PageTurnLeft path={EDIT_PROFILE_ACCOUNT} />
      <PageTurnRight
        path={EDIT_GALLERIES}
        ref={setStepRef}
        onClick={setStepComplete}
      />
      <TimelineBackground user={user} />
      <div className="relative z-1">
        <ProfileHero publicUser={user} editMode />
        <EditTimeline />
        <TimelineOnboardingPopover />
      </div>
    </PageContainer>
  );
}