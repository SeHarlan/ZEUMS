"use client";

import SolanaAssetSelect from "@/components/assets/SolanaAssetSelect";
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
import { ParsedBlockChainAsset } from "@/types/asset";
import { GalleryType } from "@/types/gallery";
import { GalleryItem, GalleryItemCreation, GalleryItemTypes } from "@/types/galleryItem";
import { getLastGalleryRowIndex } from "@/utils/gallery";
import { handleClientError } from "@/utils/handleError";
import axios from "axios";
import {
  CpuIcon,
  ImagesIcon,
} from "lucide-react";
import { FC, useMemo, useState } from "react";
import { toast } from "sonner";
import { KeyedMutator } from "swr";

const DEFAULT_COLUMNS = 3;

interface AddBlockchainGalleryItemsProps {
  gallery: GalleryType;
  mutateGallery: KeyedMutator<GalleryType | null>;
}
const AddBlockchainGalleryItems: FC<AddBlockchainGalleryItemsProps> = ({ gallery, mutateGallery }) => {
  const [selectedAssets, setSelectedAssets] = useState<ParsedBlockChainAsset[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  const source = gallery.source;

  const usedAssetAddresses = useMemo(() => { 
    const items = gallery.items
      ?.filter((item) => item.itemType === GalleryItemTypes.BlockchainAsset)
      .map((item) => item.tokenAddress) || [];
    return new Set(items);
  }, [gallery.items]);

  const handleClear = () => {
    setSelectedAssets([]);
  };

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) handleClear();
  };

  const handleAssetsAdd = async () => {
    if (!gallery) return;
    setSubmitting(true);
    const startRowIndex = getLastGalleryRowIndex(gallery) + 1;

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
        <Button variant="outline">
          <P>Add Blockchain Gallery Items</P>
          <ImagesIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className="lg:max-w-4xl h-full flex flex-col">
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
            maxSelected={33}
            withSearch
          />
        </div>

        <DialogFooter className="lg:absolute lg:bottom-6 lg:right-6">
          <Button
            type="button"
            onClick={handleAssetsAdd}
            loading={submitting}
            disabled={selectedAssets.length === 0}
            className="w-full lg:w-fit"
          >
            Create Gallery Items
            <CpuIcon />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddBlockchainGalleryItems;
