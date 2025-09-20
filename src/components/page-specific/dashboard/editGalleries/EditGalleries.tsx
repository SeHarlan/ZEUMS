import { FC, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Gallery as GalleryIcon, Settings } from "lucide-react";
import SideDrawer from "@/components/general/SideDrawer";
import NFTDrawer from "./NFTDrawer";
import GalleryGrid from "./GalleryGrid";
import GalleryForm from "./GalleryForm";
import { useGalleries, useCreateGallery, useUpdateGallery } from "@/hooks/useGalleries";
import { useCreateGalleryEntry } from "@/hooks/useGalleryEntries";
import { TimelineEntry } from "@/types/entry";
import { GalleryDisplayTypes } from "@/types/gallery";
import { toast } from "sonner";

const EditGalleries: FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedGalleryId, setSelectedGalleryId] = useState<string | null>(null);
  const [galleryItems, setGalleryItems] = useState<TimelineEntry[]>([]);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const { galleries, isLoading: galleriesLoading, mutateGalleries } = useGalleries();
  const { createGallery, isCreating } = useCreateGallery();
  const { updateGallery, isUpdating } = useUpdateGallery();
  const { createGalleryEntry, isCreatingEntry } = useCreateGalleryEntry();

  const selectedGallery = selectedGalleryId 
    ? galleries.find(g => g._id.toString() === selectedGalleryId)
    : null;

  const isSubmitting = isCreating || isUpdating || isCreatingEntry;

  // Handle adding asset to gallery
  const handleAddToGallery = useCallback((asset: TimelineEntry) => {
    setGalleryItems(prev => {
      // Check if asset is already in gallery
      if (prev.some(item => item._id.toString() === asset._id.toString())) {
        toast.error("Asset already in gallery");
        return prev;
      }
      return [...prev, asset];
    });
    setIsDrawerOpen(false);
  }, []);

  // Handle removing asset from gallery
  const handleRemoveFromGallery = useCallback((assetId: string) => {
    setGalleryItems(prev => prev.filter(item => item._id.toString() !== assetId));
  }, []);

  // Handle reordering gallery items
  const handleReorderItems = useCallback((newItems: TimelineEntry[]) => {
    setGalleryItems(newItems);
  }, []);

  // Handle creating new gallery
  const handleCreateNew = useCallback(() => {
    setSelectedGalleryId(null);
    setGalleryItems([]);
    setIsCreatingNew(true);
  }, []);

  // Handle selecting existing gallery
  const handleSelectGallery = useCallback((galleryId: string) => {
    const gallery = galleries.find(g => g._id.toString() === galleryId);
    if (gallery) {
      setSelectedGalleryId(galleryId);
      setGalleryItems(gallery.items || []);
      setIsCreatingNew(false);
    }
  }, [galleries]);

  // Handle saving gallery
  const handleSaveGallery = useCallback(async (formData: {
    title: string;
    description?: string;
    displayType: GalleryDisplayTypes;
  }) => {
    try {
      const galleryData = {
        ...formData,
        itemIds: galleryItems.map(item => item._id.toString()),
      };

      let savedGallery;

      if (isCreatingNew) {
        savedGallery = await createGallery(galleryData);
        toast.success("Gallery created successfully!");
        setIsCreatingNew(false);
        setSelectedGalleryId(null);
        setGalleryItems([]);
      } else if (selectedGalleryId) {
        savedGallery = await updateGallery({
          id: selectedGalleryId,
          data: galleryData,
        });
        toast.success("Gallery updated successfully!");
      }

      // Create gallery entry if we have a saved gallery
      if (savedGallery) {
        try {
          await createGalleryEntry({
            galleryId: savedGallery._id.toString(),
            title: formData.title,
            description: formData.description,
          });
          toast.success("Gallery entry created successfully!");
        } catch (entryError) {
          console.warn("Gallery saved but entry creation failed:", entryError);
          // Don't show error to user as gallery was saved successfully
        }
      }

      // Refresh galleries list
      mutateGalleries();
    } catch (error) {
      toast.error("Failed to save gallery");
      console.error("Error saving gallery:", error);
    }
  }, [isCreatingNew, selectedGalleryId, galleryItems, createGallery, updateGallery, createGalleryEntry, mutateGalleries]);

  // Load gallery data when selecting a gallery
  const handleGallerySelect = useCallback((galleryId: string) => {
    handleSelectGallery(galleryId);
  }, [handleSelectGallery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Galleries</h2>
          <p className="text-muted-foreground">
            Create and manage your NFT galleries
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreateNew} variant="outline">
            <Plus className="size-4 mr-2" />
            New Gallery
          </Button>
          <SideDrawer
            title="Add Assets"
            description="Search and add assets to your gallery"
            triggerButton={
              <Button>
                <GalleryIcon className="size-4 mr-2" />
                Add Assets
              </Button>
            }
            open={isDrawerOpen}
            onOpenChange={setIsDrawerOpen}
          >
            <NFTDrawer onAddToGallery={handleAddToGallery} />
          </SideDrawer>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="gallery" className="space-y-4">
        <TabsList>
          <TabsTrigger value="gallery" className="flex items-center gap-2">
            <GalleryIcon className="size-4" />
            Gallery
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="size-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gallery" className="space-y-4">
          {/* Gallery Selection */}
          {galleries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select Gallery</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {galleries.map((gallery) => (
                    <Button
                      key={gallery._id.toString()}
                      variant={selectedGalleryId === gallery._id.toString() ? "default" : "outline"}
                      className="h-auto p-4 justify-start"
                      onClick={() => handleGallerySelect(gallery._id.toString())}
                    >
                      <div className="text-left">
                        <div className="font-medium">{gallery.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {gallery.items?.length || 0} items
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Gallery Grid */}
          <GalleryGrid
            items={galleryItems}
            onReorder={handleReorderItems}
            onRemove={handleRemoveFromGallery}
          />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <GalleryForm
            initialData={selectedGallery ? {
              title: selectedGallery.title,
              description: selectedGallery.description,
              displayType: selectedGallery.displayType,
            } : undefined}
            onSubmit={handleSaveGallery}
            isSubmitting={isSubmitting}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EditGalleries;
