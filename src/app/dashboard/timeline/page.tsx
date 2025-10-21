"use client";
import EditTimeline from "@/components/dashboard/editTimeline/EditTimeline";
import { PageTurnLeft, PageTurnRight } from "@/components/dashboard/PageTurnButtons";
import { PageContainer } from "@/components/general/PageContainer";
import PageHeading from "@/components/general/PageHeading";
import ProfileHero from "@/components/timeline/ProfileHero";
import { Card, CardContent } from "@/components/ui/card";
import { EDIT_GALLERIES, EDIT_PROFILE_ACCOUNT } from "@/constants/clientRoutes";
import { useUser } from "@/context/UserProvider";


export default function EditTimelinePage() { 
  const { user } = useUser();
  return (
    <PageContainer maxWidth="large">
      <PageHeading
        title="Timeline"
        subtitle="Create and edit timeline entries"
      />
      <PageTurnLeft path={EDIT_PROFILE_ACCOUNT} />
      <PageTurnRight path={EDIT_GALLERIES} />
      <Card className="pt-0 overflow-hidden">
        <ProfileHero publicUser={user} editMode/>
        <CardContent>
          <EditTimeline />
        </CardContent>
      </Card>
    </PageContainer>
  );
}