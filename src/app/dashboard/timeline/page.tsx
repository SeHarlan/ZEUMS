"use client";
import { PageContainer } from "@/components/general/PageContainer";
import PageHeading from "@/components/general/PageHeading";
import EditTimeline from "@/components/page-specific/dashboard/editTimeline/EditTimeline";
import { PageTurnLeft, PageTurnRight } from "@/components/page-specific/dashboard/PageTurnButtons";
import { P } from "@/components/typography/Typography";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EDIT_GALLERIES, EDIT_PROFILE } from "@/constants/clientRoutes";
import { useUser } from "@/context/UserProvider";
import { EntrySource } from "@/types/entry";
import { EditTimelineTab } from "@/types/ui/dashboard";
// import GlitchFeedback from "@/components/general/GlitchFeedback";

export default function EditTimelinePage() { 
  const { user } = useUser();
  // return (
  //   <PageContainer maxWidth="large">
  //     <PageHeading
  //       title="Timeline"
  //       subtitle="Create and edit timeline entries"
  //     />
  //     <PageTurnLeft path={EDIT_PROFILE} />
  //     <PageTurnRight path={EDIT_GALLERIES} />
  //     <GlitchFeedback title={"Timeline"} subtitle={"Coming very soon..."} />
  //   </PageContainer>
  // );

    const contentMap = [
      {
        title: "Created",
        value: EditTimelineTab.ARTIST,
        source: EntrySource.Creator,
      },
      {
        title: "Collected",
        value: EditTimelineTab.COLLECTOR,
        source: EntrySource.Collector,
      },
      {
        title: "Curator",
        value: EditTimelineTab.CURATOR,
        source: undefined, // TODO: add curator source
      }
    ];

    const orderedContent = () => {
      switch (user?.primaryTimeline) {
        case EditTimelineTab.CURATOR:
          return [contentMap[2], contentMap[1], contentMap[0]];
        case EditTimelineTab.COLLECTOR:
          return [contentMap[1], contentMap[2], contentMap[0]];
        default:
          return [contentMap[0], contentMap[1], contentMap[2]];
      }
    }

    const content = orderedContent().filter(
      (item): item is NonNullable<typeof item> => Boolean(item)
    );

  return (
    <PageContainer maxWidth="large">
      <PageHeading
        title="Timeline"
        subtitle="Create and edit timeline entries"
      />
      <PageTurnLeft path={EDIT_PROFILE} />
      <PageTurnRight path={EDIT_GALLERIES} />
      <Card>
        <CardContent>
          <Tabs defaultValue={content[0].value}>
            <TabsList className="w-full justify-stretch">
              {content.map((item) => (
                <TabsTrigger key={item.value} value={item.value}>
                  {item.title}
                </TabsTrigger>
              ))}
            </TabsList>

            {content.map((item) => (
              <TabsContent key={item.value} value={item.value} className="flex flex-col space-y-8 mt-8">
                {item.source ? <EditTimeline source={item.source} /> : <P className="italic text-center">Coming Soon...</P>}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </PageContainer>
  );
}