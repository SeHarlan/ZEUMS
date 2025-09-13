import SolanaAssetSelect from "@/components/assets/SolanaAssetSelect";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ParsedBlockChainAsset } from "@/types/asset";
import { EntrySource } from "@/types/entry";
import { ImageType, ImageVariant } from "@/types/media";
import { convertMediaToImage } from "@/utils/media";

import { CpuIcon } from "lucide-react";
import { FC, useState } from "react";

interface ChooseProfileImageDialogProps {
  imageVariant: ImageVariant;
  setSelectedMedia: (media: ImageType | undefined) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const ChooseProfileImageDialog: FC<ChooseProfileImageDialogProps> = ({
  setSelectedMedia,
  open,
  setOpen,
  imageVariant,
}) => {
  const [selectedAssets, setSelectedAssets] = useState<ParsedBlockChainAsset[]>(
    []
  );

  const handleAssetAdd = () => {
    const media = convertMediaToImage(selectedAssets[0].media)
    setSelectedMedia(media);
    setOpen(false);
  };

  const title = imageVariant === "profile" ? "Select Profile Image" : "Select Banner Image";
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="lg:max-w-4xl h-full flex flex-col">
        <DialogHeader className="flex-row justify-between items-center">
          <DialogTitle className="w-fit">{title}</DialogTitle>
          <DialogDescription className="sr-only">
            This dialog allows you to select an image from the blockchain to add to your
            profile.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0">
          <SolanaAssetSelect
            selectedAssets={selectedAssets}
            setSelectAssets={setSelectedAssets}
            source={EntrySource.Collector}
            withSearch
            imageVariant={imageVariant}
          />
        </div>

        {/* sm is the break point where the footer becomes full width (and when the pagination would overlap) */}
        <DialogFooter className="sm:absolute sm:bottom-6 sm:right-6">
          <Button
            type="button"
            onClick={handleAssetAdd}
            disabled={!selectedAssets.length}
          >
            Select
            <CpuIcon />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

};

export default ChooseProfileImageDialog;
