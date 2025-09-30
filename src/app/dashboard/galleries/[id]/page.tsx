"use client";

import { PageContainer } from "@/components/general/PageContainer";
import PageHeading from "@/components/general/PageHeading";
import EditGallerySettings from "@/components/dashboard/editGalleries/EditGallerySettings";
import { PageTurnLeft } from "@/components/dashboard/PageTurnButtons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EDIT_GALLERIES } from "@/constants/clientRoutes";
import useGalleryById from "@/hooks/useGalleryById";
import { SettingsIcon } from "lucide-react";

import { useParams } from "next/navigation";
import { useState } from "react";
import EditGalleryItems from "@/components/dashboard/editGalleryItems/EditGalleryItems";
import { P } from "@/components/typography/Typography";
import FeedbackWrapper from "@/components/general/FeedbackWrapper";

const EditGalleryPage = () => {
  const { id } = useParams<{ id: string }>();
  const { gallery, mutateGallery, isLoading, isError } = useGalleryById(id);
  const [ isSettingsOpen, setIsSettingsOpen ] = useState(false);

  return (
    <PageContainer maxWidth="large">
      <PageHeading
        title={`Edit Gallery`}
        subtitle="Curate and manage your gallery content"
      />
      <PageTurnLeft path={EDIT_GALLERIES} />
      <FeedbackWrapper
        isLoading={isLoading}
        isError={isError}
        hasData={!!gallery}
        noDataSubtitle="Gallery not found"
        useSpinner
      >
        <Card>
          <CardContent>
            <div className="relative flex justify-between items-start ">
              <PageHeading
                title={gallery?.title || "Title"}
                subtitle={gallery?.description}
                className=""
              />
              <Button onClick={() => setIsSettingsOpen(true)} variant="outline">
                <P className="hidden sm:block">Edit Gallery Settings</P>
                <SettingsIcon />
              </Button>
            </div>
            {gallery && <EditGalleryItems gallery={gallery} mutateGallery={mutateGallery} />}
          </CardContent>
        </Card>
      </FeedbackWrapper>
      <EditGallerySettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        galleryId={id}
      />
    </PageContainer>
  );
};

export default EditGalleryPage;