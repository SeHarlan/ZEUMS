import { PageContainer } from "@/components/general/PageContainer";
import PageHeading from "@/components/general/PageHeading";
import EditGalleries from "@/components/dashboard/editGalleries/EditGalleries";
import { PageTurnLeft } from "@/components/dashboard/PageTurnButtons";
import SourceTabs from "@/components/dashboard/SourceTabs";
import { Card, CardContent } from "@/components/ui/card";
import { EDIT_TIMELINE } from "@/constants/clientRoutes";

export default function EditGalleriesPage() {
  return (
    <PageContainer maxWidth="large">
      <PageHeading
        title="Galleries"
        subtitle="Create and manage your galleries"
      />
      <PageTurnLeft path={EDIT_TIMELINE} />
      <Card>
        <CardContent>
          <SourceTabs EditComponent={EditGalleries} />
        </CardContent>
      </Card>
    </PageContainer>
  );
} 