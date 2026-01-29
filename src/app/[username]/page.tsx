"use client";

import { useShowReturnButton } from "@/atoms/navigation";
import FeedbackWrapper from "@/components/general/FeedbackWrapper";
import { PageContainer } from "@/components/general/PageContainer";
import { BackgroundImage } from "@/components/media/BackgroundImage";
import { ShareButton } from "@/components/navigation/ShareButton";
import EntryBase from "@/components/timeline/EntryBase";
import ProfileHero from "@/components/timeline/ProfileHero";
import { TimelineSelect } from "@/components/timeline/TimelineSelect";
import { P } from "@/components/typography/Typography";
import { LinkButton } from "@/components/ui/button";
import { EDIT_TIMELINE } from "@/constants/clientRoutes";
import { NavBarActions } from "@/context/NavBarActionsProvider";
import { useUser } from "@/context/UserProvider";
import useUserByUsername from "@/hooks/useUserByUsername";
import { EditIcon } from "lucide-react";
import { useParams } from "next/navigation";


export default function UserTimelinePage() {
  const { username } = useParams<{ username: string }>();
  const { user: timelineUser, isLoading, isError } = useUserByUsername(username);
  const { user: loggedInUser } = useUser();
  useShowReturnButton();
  
  const isUsersPage = loggedInUser?._id.toString() === timelineUser?._id.toString();

  return (
    <PageContainer maxWidth="large" noPadding>
      <NavBarActions>
        {isUsersPage && (
          <LinkButton
            href={EDIT_TIMELINE}
            variant="outline"
            className="size-10 md:w-fit"
          >
            <EditIcon className="size-5 md:size-4" />
            <P className="hidden md:block">Edit</P>
          </LinkButton>
        )}
        <ShareButton />
      </NavBarActions>
      <FeedbackWrapper
        isLoading={isLoading}
        isError={isError}
        hasData={!!timelineUser}
        noDataSubtitle="User not found"
      >
        <BackgroundImage user={timelineUser} />
        <div className="relative z-1">
          <ProfileHero publicUser={timelineUser} />
          <TimelineSelect user={timelineUser} EntryComponent={EntryBase} />
        </div>
      </FeedbackWrapper>
    </PageContainer>
  );
}
