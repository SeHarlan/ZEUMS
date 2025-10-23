"use client";

import FeedbackWrapper from "@/components/general/FeedbackWrapper";
import { PageContainer } from "@/components/general/PageContainer";
import { ShareButton } from "@/components/navigation/ShareButton";
import EntryBase from "@/components/timeline/EntryBase";
import ProfileHero from "@/components/timeline/ProfileHero";
import { TimelineSelect } from "@/components/timeline/TimelineSelect";
import { NavBarActions } from "@/context/NavBarActionsProvider";
import useUserByUsername from "@/hooks/useUserByUsername";
import { useParams } from "next/navigation";


export default function UserTimelinePage() {
  const { username } = useParams<{ username: string }>();
  const { user, isLoading, isError } = useUserByUsername(username);

  return (
    <PageContainer maxWidth="large" noPadding>
      <NavBarActions>
        <ShareButton />
      </NavBarActions>
      <FeedbackWrapper
        isLoading={isLoading}
        isError={isError}
        hasData={!!user}
        noDataSubtitle="User not found"
      >
        <ProfileHero publicUser={user} />
        <TimelineSelect user={user} EntryComponent={EntryBase} />
      </FeedbackWrapper>
    </PageContainer>
  );
}
