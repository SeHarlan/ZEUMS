"use client";

import { PageContainer } from "@/components/general/PageContainer";
import TimelineBase from "@/components/timeline/TimelineBase";
import EntryBase from "@/components/timeline/EntryBase";
import useUserByUsername from "@/hooks/useUserByUsername";
import { EntrySource } from "@/types/entry";
import FeedbackWrapper from "@/components/general/FeedbackWrapper";
import { useParams } from "next/navigation";
import ProfileHero from "@/components/timeline/ProfileHero";
import { PAGE_PADDING_X } from "@/components/general/PageContainer";


export default function UserTimelinePage() {
  const { username } = useParams<{ username: string }>();
  const { user, isLoading, isError } = useUserByUsername(username);
  
  return (
    <PageContainer maxWidth="large" noPadding>
      <FeedbackWrapper
        isLoading={isLoading}
        isError={isError}
        hasData={!!user}
        noDataSubtitle="User not found"
      >
        <ProfileHero publicUser={user} />
        <div className={PAGE_PADDING_X}>
          <TimelineBase
            source={EntrySource.Creator}
            createdTimelineEntries={user?.createdTimelineEntries}
            collectedTimelineEntries={[]}
            EntryComponent={EntryBase}
          />
        </div>
      </FeedbackWrapper>
    </PageContainer>
  );
}
