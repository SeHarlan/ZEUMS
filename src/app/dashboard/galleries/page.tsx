"use client";

import EditGalleries from "@/components/dashboard/editGalleries/EditGalleries";
import { PageTurnLeft } from "@/components/dashboard/PageTurnButtons";
import { PageContainer } from "@/components/general/PageContainer";
import PageHeading from "@/components/general/PageHeading";
import { GalleriesOnboardingPopover } from "@/components/onboarding/GalleriesOnboarding";
import { Card, CardContent } from "@/components/ui/card";
import { EDIT_TIMELINE } from "@/constants/clientRoutes";

export default function EditGalleriesPage() {  
  return (
    <PageContainer maxWidth="large">
      <PageHeading
        title="Manage Galleries"
        subtitle="Curated collections that expand on your creative story."
      />
      <PageTurnLeft path={EDIT_TIMELINE} />
      <Card>
        <CardContent>
          <EditGalleries />
        </CardContent>
      </Card>
      <GalleriesOnboardingPopover />
    </PageContainer>
  );
} 