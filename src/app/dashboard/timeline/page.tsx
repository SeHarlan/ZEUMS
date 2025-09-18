import { PageContainer } from "@/components/general/PageContainer";
import PageHeading from "@/components/general/PageHeading";
import EditTimeline from "@/components/page-specific/dashboard/editTimeline/EditTimeline";
import { PageTurnLeft, PageTurnRight } from "@/components/page-specific/dashboard/PageTurnButtons";
import { P } from "@/components/typography/Typography";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EDIT_GALLERIES, EDIT_PROFILE } from "@/constants/clientRoutes";
import { EntrySource } from "@/types/entry";
import { EditTimelineTab } from "@/types/ui/dashboard";

export default function EditTimelinePage() { 
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
          <Tabs defaultValue={EditTimelineTab.ARTIST}>
            <TabsList className="w-full justify-stretch">
              <TabsTrigger value={EditTimelineTab.ARTIST}>Artist</TabsTrigger>
              <TabsTrigger value={EditTimelineTab.COLLECTOR}>
                Collector
              </TabsTrigger>
              <TabsTrigger value={EditTimelineTab.CURATOR}>Curator</TabsTrigger>
            </TabsList>

            <TabsContent
              value={EditTimelineTab.ARTIST}
              className="flex flex-col space-y-8 mt-8"
            >
              <EditTimeline source={EntrySource.Creator} />
            </TabsContent>
            <TabsContent
              value={EditTimelineTab.COLLECTOR}
              className="flex flex-col space-y-8 mt-8"
            >
              <EditTimeline source={EntrySource.Collector} />
            </TabsContent>
            <TabsContent
              value={EditTimelineTab.CURATOR}
              className="flex flex-col space-y-8 mt-8"
            >
              <P className="italic text-center">Coming Soon...</P>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </PageContainer>
  );
}