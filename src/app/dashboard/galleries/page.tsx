import { PageContainer } from "@/components/general/PageContainer";
import PageHeading from "@/components/general/PageHeading";
import EditGalleries from "@/components/page-specific/dashboard/editGalleries/EditGalleries";
import { PageTurnLeft } from "@/components/page-specific/dashboard/PageTurnButtons";
import { EDIT_TIMELINE } from "@/constants/clientRoutes";

export default function EditGalleriesPage() {
  return (
    <PageContainer maxWidth="large">
      <PageHeading
        title="Galleries"
        subtitle="Create and manage your galleries"
      />
      <PageTurnLeft path={EDIT_TIMELINE} />
      <EditGalleries />
    </PageContainer>
  );
} 