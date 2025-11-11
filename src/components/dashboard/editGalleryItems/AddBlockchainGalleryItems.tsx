"use client";

import SolanaAssetSelect from "@/components/assets/SolanaAssetSelect";
import { BlockchainAssetEntryIcon } from "@/components/icons/EntryTypes";
import { P } from "@/components/typography/Typography";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { GALLERY_ITEM_ITEMS_ROUTE, } from "@/constants/serverRoutes";
import { useUser } from "@/context/UserProvider";
import useGalleryById from "@/hooks/useGalleryById";
import { ParsedBlockChainAsset } from "@/types/asset";
import { EntrySource } from "@/types/entry";
import { GalleryItem, GalleryItemCreation, GalleryItemTypes } from "@/types/galleryItem";
import { getLastGalleryRowIndex } from "@/utils/gallery";
import { handleClientError } from "@/utils/handleError";
import axios from "axios";
import { ImagesIcon } from "lucide-react";
import { FC, useMemo, useState } from "react";
import { toast } from "sonner";

const DEFAULT_COLUMNS = 3;

interface AddBlockchainGalleryItemsProps {
  galleryId: string;
  children?: React.ReactNode;
  onSave?: () => void;
}
const AddBlockchainGalleryItems: FC<AddBlockchainGalleryItemsProps> = ({ galleryId, children, onSave }) => {
  const { gallery, mutateGallery } = useGalleryById(galleryId);
  const { revalidateUser } = useUser();
  const [selectedAssets, setSelectedAssets] = useState<ParsedBlockChainAsset[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [optimisticallySelectedAssets, setOptimisticallySelectedAssets] = useState<Set<string>>(new Set());

  const source = gallery?.source || EntrySource.Creator;

  const usedAssetAddresses = useMemo(() => { 
    const items = gallery?.items
      ?.filter((item) => item.itemType === GalleryItemTypes.BlockchainAsset)
      .map((item) => item.tokenAddress) || [];
    return new Set(items);
  }, [gallery?.items]);

  const handleClear = () => {
    setSelectedAssets([]);
    setOptimisticallySelectedAssets(new Set());
  };

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) handleClear();
  };

  const handleAssetsAdd = async () => {
    if (!gallery) return;
    setSubmitting(true);
    const startRowIndex = getLastGalleryRowIndex(gallery.items) + 1;

    const galleryItemsCreationData: GalleryItemCreation[] = selectedAssets.map((asset, index) => {
      const totalColumns = DEFAULT_COLUMNS;
      const rowIndex = Math.floor(index / totalColumns);
      const columnIndex = index % totalColumns;
      const position: [number, number] = [
        startRowIndex + rowIndex,
        columnIndex,
      ];
  
      return {
        ...asset,
        itemType: GalleryItemTypes.BlockchainAsset,
        source,
        position,
        parentGalleryId: gallery._id.toString(),
      }
    });

    axios
      .post<{ createdGalleryItems: GalleryItem[] }>(
        GALLERY_ITEM_ITEMS_ROUTE,
        galleryItemsCreationData
      )
      .then((response) => {
        const { createdGalleryItems } = response.data;

        if (createdGalleryItems.length < galleryItemsCreationData.length) {
          toast.info("Some gallery items failed to be saved.");
        } else {
          toast.success("All Gallery Items saved!");
        }

        // Update the gallery data using SWR mutation
        mutateGallery((prev) => {
          if (!prev) return prev;
          const prevItems = prev.items || [];
          return {
            ...prev,
            items: [...prevItems, ...createdGalleryItems],
          };
        }, false);

        // Revalidate user if the first two rows changed
        // Will effect user gallery cards and gallery entries
        if (createdGalleryItems.some((item) => item.position[0] < 2)) {
          revalidateUser();
        }

        onSave?.();
        handleOpenChange(false);
      })
      .catch((error) => {
        toast.error("Failed to create new Gallery Items.");
        handleClientError({
          error,
          location: "AddBlockchainGalleryItems_handleAssetsAdd",
        });
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || (
        <Button variant="outline">
            <P className="hidden md:block">Add Blockchain Gallery Items</P>
            <ImagesIcon />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="lg:max-w-4xl h-full flex flex-col gap-2">
        <DialogHeader className="flex-row justify-between items-center">
          <DialogTitle className="w-fit">Select Blockchain Gallery Items</DialogTitle>
          <DialogDescription className="sr-only">
            This dialog allows you to select blockchain assets to add to your
            gallery.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0">
          <SolanaAssetSelect
            usedAssetAddresses={usedAssetAddresses}
            selectedAssets={selectedAssets}
            setSelectAssets={setSelectedAssets}
            source={source}
            maxSelected={20}
            withSearch
            optimisticallySelectedAssets={optimisticallySelectedAssets}
            setOptimisticallySelectedAssets={setOptimisticallySelectedAssets}
          />
        </div>

        <DialogFooter className="lg:absolute lg:bottom-6 lg:right-6">
          <Button
            type="button"
            onClick={handleAssetsAdd}
            loading={submitting}
            disabled={selectedAssets.length === 0 || optimisticallySelectedAssets.size > 0}
            className="w-full lg:w-fit"
          >
            Create Gallery Items
            <BlockchainAssetEntryIcon />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddBlockchainGalleryItems;
