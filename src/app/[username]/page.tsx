"use client";

import { PageContainer } from "@/components/general/PageContainer";
import TimelineBase from "@/components/timeline/TimelineBase";
import EntryBase from "@/components/timeline/EntryBase";
import useUserByUsername from "@/hooks/useUserByUsername";
import FeedbackWrapper from "@/components/general/FeedbackWrapper";
import { useParams } from "next/navigation";
import ProfileHero from "@/components/timeline/ProfileHero";
import { PAGE_PADDING_X } from "@/components/general/PageContainer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditTimelineTab } from "@/types/ui/dashboard";
import { cn } from "@/utils/ui-utils";
import { P } from "@/components/typography/Typography";


export default function UserTimelinePage() {
  const { username } = useParams<{ username: string }>();
  const { user, isLoading, isError } = useUserByUsername(username);

  const contentMap = [
    user?.createdTimelineEntries?.length ? {
      title: "Created",
      value: EditTimelineTab.ARTIST,
      entries: user.createdTimelineEntries,
    } : undefined,
    user?.collectedTimelineEntries?.length ? {
      title: "Collected",
      value: EditTimelineTab.COLLECTOR,
      entries: user.collectedTimelineEntries,
    } : undefined,
  ];

  const orderedContent = user?.primaryTimeline === EditTimelineTab.COLLECTOR
    ? [contentMap[1], contentMap[0]]
    : [contentMap[0], contentMap[1]];
  
  const content = orderedContent.filter(
    (item): item is NonNullable<typeof item> => Boolean(item)
  );
  

  return (
    <PageContainer maxWidth="large" noPadding>
      <FeedbackWrapper
        isLoading={isLoading}
        isError={isError}
        hasData={!!user}
        noDataSubtitle="User not found"
      >
        <ProfileHero publicUser={user} />
        <div className={cn(PAGE_PADDING_X, "py-4")}>
          {content.length <= 1 ? (
            <TimelineBase
              entries={content[0]?.entries || []}
              EntryComponent={EntryBase}
            />
          ) : (
            <Tabs defaultValue={content[0].value}>
              <TabsList className="w-fit flex-wrap bg-transparent mx-auto">
                {content.map((item) => (
                  <TabsTrigger
                    key={item.value}
                    value={item.value}
                    className="w-fit px-4 bg-transparent data-[state=active]:text-lg data-[state=active]:shadow-none rounded-none border-0 border-transparent border-b-3 data-[state=active]:border-border hover:border-border/75 transition-[border-color] duration-300"
                  >
                    <P className="font-serif">{item.title}</P>
                  </TabsTrigger>
                ))}
              </TabsList>

              {content.map((item) => (
                <TabsContent key={item.value} value={item.value} className="">
                  <TimelineBase
                    entries={item.entries}
                    EntryComponent={EntryBase}
                  />
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
      </FeedbackWrapper>
    </PageContainer>
  );
}
