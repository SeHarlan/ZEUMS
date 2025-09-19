"use client";

import { PageContainer } from "@/components/general/PageContainer";
import TimelineBase from "@/components/timeline/TimelineBase";
import EntryBase from "@/components/timeline/EntryBase";
import useUserByUsername from "@/hooks/useUserByUsername";
import { EntrySource } from "@/types/entry";
import FeedbackWrapper from "@/components/general/FeedbackWrapper";
import { useParams } from "next/navigation";


export default function UserTimelinePage() {
  const { username } = useParams<{ username: string }>();
  const { user, isLoading, isError } = useUserByUsername(username);
  
  return (
    <PageContainer maxWidth="large">
      <FeedbackWrapper
        isLoading={isLoading}
        isError={isError}
        hasData={!!user}
        noDataSubtitle="User not found"
      >
        <TimelineBase
          source={EntrySource.Creator}
          createdTimelineEntries={user?.createdTimelineEntries}
          collectedTimelineEntries={[]}
          EntryComponent={EntryBase}
        />
      </FeedbackWrapper>
    </PageContainer>
  );
}
