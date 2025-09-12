import AssetThumbnail from "@/components/assets/AssetThumbnail";
import MediaPreviewViewer from "@/components/assets/MediaPreviewViewer";
import SolanaAssetSelect from "@/components/assets/SolanaAssetSelect";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ParsedBlockChainAsset } from "@/types/asset";
import { EntrySource } from "@/types/entry";
import { MediaCategory } from "@/types/media";
import { getImageAspectRatio, getVideoAspectRatio } from "@/utils/media";

import { CpuIcon, Trash2Icon } from "lucide-react";
import { FC, useState } from "react";

interface SelectBlockchainAssetProps {
  source: EntrySource;
  blockchainAsset: ParsedBlockChainAsset | null;
  setBlockchainAsset: (media: ParsedBlockChainAsset | null) => void;
  setAspectRatio?: (aspectRatio: number | null) => void;
}

const SelectBlockchainAsset: FC<SelectBlockchainAssetProps> = ({
  blockchainAsset,
  setBlockchainAsset,
  source,
  setAspectRatio,
}) => {
  const [selectedAssets, setSelectedAssets] = useState<ParsedBlockChainAsset[]>([]);

  const handleAssetAdd = () => {
    setBlockchainAsset(selectedAssets[0]);
  }

  const handleRemoveAsset = () => {
    setBlockchainAsset(null);
  }

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
            <CpuIcon className="size-12 text-muted-foreground" />
            <Button type="button">Choose blockchain asset</Button>
          </div>
        </DialogTrigger>
        <DialogContent className="lg:max-w-4xl h-full flex flex-col">
          <DialogHeader className="flex-row justify-between items-center">
            <DialogTitle className="w-fit">Select Blockchain Asset</DialogTitle>
            <DialogDescription className="sr-only">
              This dialog allows you to select a blockchain asset to add to your timeline.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 min-h-0">
            <SolanaAssetSelect
              selectedAssets={selectedAssets}
              setSelectAssets={setSelectedAssets}
              source={source}
              withSearch
            />
          </div>

          {/* sm is the break point where the footer becomes full width (and when the pagination would overlap) */}
          <DialogFooter className="sm:absolute sm:bottom-6 sm:right-6">
            <Button type="button" onClick={handleAssetAdd} disabled={selectedAssets.length === 0}>
              Select
              <CpuIcon />
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
        <Trash2Icon />
      </Button>

      <AssetThumbnail
        asset={blockchainAsset}
        onLoad={handleImageAspectRatio}
        objectFit="object-contain"
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