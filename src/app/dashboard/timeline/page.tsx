"use client";
import { PageContainer } from "@/components/general/PageContainer";
import PageHeading from "@/components/general/PageHeading";
import EditTimeline from "@/components/dashboard/editTimeline/EditTimeline";
import { PageTurnLeft, PageTurnRight } from "@/components/dashboard/PageTurnButtons";
import SourceTabs from "@/components/dashboard/SourceTabs";
import { Card, CardContent } from "@/components/ui/card";
import { EDIT_GALLERIES, EDIT_PROFILE } from "@/constants/clientRoutes";


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
          <SourceTabs EditComponent={EditTimeline} />
        </CardContent>
      </Card>
    </PageContainer>
  );
}