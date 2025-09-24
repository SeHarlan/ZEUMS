"use client";

import { PageContainer } from "@/components/general/PageContainer";
import PageHeading from "@/components/general/PageHeading";
import { PageTurnLeft } from "@/components/page-specific/dashboard/PageTurnButtons";
import { Card, CardContent } from "@/components/ui/card";
import { EDIT_GALLERIES } from "@/constants/clientRoutes";
import useGalleryById from "@/hooks/useGalleryById";

import { useParams } from "next/navigation";

const EditGalleryPage = () => {
  const { id } = useParams<{ id: string }>();
  const { gallery, isLoading, isError } = useGalleryById(id);

  return (
    <PageContainer maxWidth="large">
      <PageHeading
        title="Galleries"
        subtitle="Create and manage your galleries"
      />
      <PageTurnLeft path={EDIT_GALLERIES} />
      <Card>
        <CardContent>
          {gallery?.title}
          {gallery?.description}
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default EditGalleryPage;