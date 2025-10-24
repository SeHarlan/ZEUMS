"use client";
import EditTimeline from "@/components/dashboard/editTimeline/EditTimeline";
import { PageTurnLeft, PageTurnRight } from "@/components/dashboard/PageTurnButtons";
import { PageContainer } from "@/components/general/PageContainer";
import PageHeading from "@/components/general/PageHeading";
import ProfileHero from "@/components/timeline/ProfileHero";
import { Card } from "@/components/ui/card";
import { EDIT_GALLERIES, EDIT_PROFILE_ACCOUNT } from "@/constants/clientRoutes";
import { useUser } from "@/context/UserProvider";

export default function EditTimelinePage() { 
  const { user } = useUser();
  return (
    <PageContainer maxWidth="large">
      <PageHeading
        title="Manage Timeline"
        subtitle="Highlighted artworks, galleries, and words that create a cohesive entry point into your creative world"
      />

      <PageTurnLeft path={EDIT_PROFILE_ACCOUNT} />
      <PageTurnRight path={EDIT_GALLERIES} />
      <Card className="pt-0 overflow-hidden">
        <ProfileHero publicUser={user} editMode />
        <EditTimeline />
      </Card>
    </PageContainer>
  );
}