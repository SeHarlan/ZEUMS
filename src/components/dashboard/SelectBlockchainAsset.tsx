import MediaThumbnail from "@/components/media/MediaThumbnail";
import MediaPreviewViewer from "@/components/assets/MediaPreviewViewer";
import SolanaAssetSelect from "@/components/assets/SolanaAssetSelect";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ParsedBlockChainAsset } from "@/types/asset";
import { EntrySource } from "@/types/entry";
import { MediaCategory } from "@/types/media";
import { getImageAspectRatio, getVideoAspectRatio } from "@/utils/media";

import { TrashIcon } from "lucide-react";
import { FC, useState } from "react";
import { BlockchainAssetEntryIcon } from "../icons/EntryTypes";

interface SelectBlockchainAssetProps {
  usedAssetAddresses: Set<string>;
  source: EntrySource;
  blockchainAsset: ParsedBlockChainAsset | null;
  setBlockchainAsset: (media: ParsedBlockChainAsset | null) => void;
  setAspectRatio?: (aspectRatio: number | null) => void;
}

const SelectBlockchainAsset: FC<SelectBlockchainAssetProps> = ({
  usedAssetAddresses,
  blockchainAsset,
  setBlockchainAsset,
  source,
  setAspectRatio,
}) => {
  const [selectedAssets, setSelectedAssets] = useState<ParsedBlockChainAsset[]>([]);
  const [optimisticallySelectedAssets, setOptimisticallySelectedAssets] = useState<Set<string>>(new Set());

  const handleAssetAdd = () => {
    setBlockchainAsset(selectedAssets[0]);
  }

  const handleRemoveAsset = () => {
    setBlockchainAsset(null);
  }

  //TODO: refactor this to use the aspect Ratio provider
  const handleVideoAspectRatio = (videoElement: HTMLVideoElement) => { 
    if (setAspectRatio && blockchainAsset?.media.category === MediaCategory.Video) {
      const aspectRatio = getVideoAspectRatio(videoElement)
      setAspectRatio(aspectRatio);
    }
  }

  const handleImageAspectRatio = (imageElement: HTMLImageElement) => {
    if (setAspectRatio && blockchainAsset?.media.category !== MediaCategory.Video) {
      const aspectRatio = getImageAspectRatio(imageElement)
      setAspectRatio(aspectRatio);
    }
  };

  if (blockchainAsset === null) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <div className="p-2 flex flex-col items-center justify-center gap-4">
            <BlockchainAssetEntryIcon className="size-12 text-muted-foreground" />
            <Button type="button">Choose blockchain asset</Button>
          </div>
        </DialogTrigger>
        <DialogContent className="lg:max-w-4xl h-full flex flex-col">
          <DialogHeader className="flex-row justify-between items-center">
            <DialogTitle className="w-fit">Select Blockchain Asset</DialogTitle>
            <DialogDescription className="sr-only">
              This dialog allows you to select a blockchain asset to add to your
              timeline.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 min-h-0">
            <SolanaAssetSelect
              usedAssetAddresses={usedAssetAddresses}
              optimisticallySelectedAssets={optimisticallySelectedAssets}
              setOptimisticallySelectedAssets={setOptimisticallySelectedAssets}
              selectedAssets={selectedAssets}
              setSelectAssets={setSelectedAssets}
              source={source}
              withSearch
            />
          </div>

          {/* sm is the break point where the footer becomes full width (and when the pagination would overlap) */}
          <DialogFooter className="sm:absolute sm:bottom-6 sm:right-6">
            <Button
              type="button"
              onClick={handleAssetAdd}
              disabled={
                selectedAssets.length === 0 ||
                optimisticallySelectedAssets.size > 0
              }
            >
              Select
              <BlockchainAssetEntryIcon />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 relative">
      <Button
        onClick={handleRemoveAsset}
        size="sm"
        className="absolute -top-2 -left-2 z-2"
      >
        <TrashIcon />
      </Button>

      <MediaThumbnail
        media={blockchainAsset.media}
        alt={blockchainAsset.title}
        onLoad={handleImageAspectRatio}
      />

      {blockchainAsset.media.category !== MediaCategory.Image ? (
        <MediaPreviewViewer
          media={blockchainAsset.media}
          onVideoLoad={handleVideoAspectRatio}
          className="w-full h-full"
        />
      ) : null}
    </div>
  );
};

export default SelectBlockchainAsset;