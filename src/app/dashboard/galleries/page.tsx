import PageHeading from "@/components/general/PageHeading";
import EditGalleries from "@/components/pages/dashboard/editGalleries/EditGalleries";
import { PageTurnLeft } from "@/components/pages/dashboard/PageTurnButtons";
import { EDIT_TIMELINE } from "@/constants/clientRoutes";

export default function EditGalleriesPage() {
  return (
    <div>
      <PageHeading
        title="Galleries"
        subtitle="Create and manage your galleries"
      />
      <PageTurnLeft path={EDIT_TIMELINE} />
      <EditGalleries />
    </div>
  );
} 