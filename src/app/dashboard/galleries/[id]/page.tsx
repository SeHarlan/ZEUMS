"use client";

import FeedbackWrapper from "@/components/general/FeedbackWrapper";
import { PageContainer } from "@/components/general/PageContainer";
import PageHeading from "@/components/general/PageHeading";
import EditGallerySettings from "@/components/dashboard/editGalleries/EditGallerySettings";
import GalleryPreview from "@/components/dashboard/editGalleries/GalleryPreview";
import NewItemForm from "@/components/dashboard/editGalleryItems/newItemForm/NewItemForm";
import { PageTurnLeft } from "@/components/dashboard/PageTurnButtons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EDIT_GALLERIES } from "@/constants/clientRoutes";
import useGalleryById from "@/hooks/useGalleryById";
import { SettingsIcon } from "lucide-react";

import { useParams } from "next/navigation";
import { useState } from "react";

const EditGalleryPage = () => {
  const { id } = useParams<{ id: string }>();
  const { gallery, isLoading, isError } = useGalleryById(id);
  const [ isSettingsOpen, setIsSettingsOpen ] = useState(false);

  return (
    <FeedbackWrapper
      isLoading={isLoading}
      isError={isError}
      hasData={!!gallery}
      noDataSubtitle="Gallery not found"
    >
      <PageContainer maxWidth="large">
        <PageHeading
          title={`Edit Gallery`}
          subtitle="Curate and manage your gallery content"
        />
        <PageTurnLeft path={EDIT_GALLERIES} />
        <Card>
          <CardContent>
            <div className="relative flex justify-between items-start">
              <PageHeading
                title={gallery?.title || "Title"}
                subtitle={gallery?.description}
              />
              <Button onClick={() => setIsSettingsOpen(true)} variant="outline">
                Edit Gallery Settings
                <SettingsIcon />
              </Button>
            </div>
            {gallery && (
              <div className="space-y-6">
                  <NewItemForm source={gallery.source} galleryId={gallery._id.toString()} />
                  <GalleryPreview source={gallery.source} galleryId={gallery._id.toString()} />
              </div>
            )}
          </CardContent>
        </Card>
        <EditGallerySettings
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          galleryId={id}
        />
      </PageContainer>
    </FeedbackWrapper>
  );
};

export default EditGalleryPage;