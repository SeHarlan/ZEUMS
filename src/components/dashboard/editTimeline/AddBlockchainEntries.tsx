"use client";

import SolanaAssetSelect from "@/components/assets/SolanaAssetSelect";
import { BlockchainAssetEntryIcon } from "@/components/icons/EntryTypes";
import { P } from "@/components/typography/Typography";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ENTRY_ENTRIES_ROUTE } from "@/constants/serverRoutes";
import { useUser } from "@/context/UserProvider";
import { TIMELINE_ENTRY_LABEL } from "@/textCopy/mainCopy";
import { ParsedBlockChainAsset } from "@/types/asset";
import { EntrySource, EntryTypes, TimelineBlockchainEntryCreation, TimelineEntry } from "@/types/entry";
import { handleClientError } from "@/utils/handleError";
import { getTimelineKey, parseEntryDates, sortTimeline } from "@/utils/timeline";
import axios from "axios";
import { ImagesIcon } from "lucide-react";
import { FC, useMemo, useState } from "react";
import { toast } from "sonner";
import CreateGalleryDialogButton from "../editGalleries/CreateGalleryDialog";

export const MAX_SELECTED_ASSETS = 8;
interface AddBlockchainEntriesProps {
  source: EntrySource;
  children?: React.ReactNode;
  onSave?: () => void;
} 

const AddBlockchainEntries: FC<AddBlockchainEntriesProps> = ({
  source,
  children,
  onSave
}) => {
  const { setUser, user } = useUser();

  const [selectedAssets, setSelectedAssets] = useState<ParsedBlockChainAsset[]>(
    []
  );
  const [optimisticallySelectedAssets, setOptimisticallySelectedAssets] =
    useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  const timelineKey = getTimelineKey(source);

  const usedAssetAddresses = useMemo(() => {
    const currentTimeline = user?.[timelineKey] || [];
    const items =
      currentTimeline
        ?.filter((item) => item.entryType === EntryTypes.BlockchainAsset)
        .map((item) => item.tokenAddress) || [];
    return new Set(items);
  }, [user, timelineKey]);

  const handleClear = () => {
    setSelectedAssets([]);
    setOptimisticallySelectedAssets(new Set());
  };

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) handleClear();
  };

  const handleAssetsAdd = async () => {
    setSubmitting(true);

    const entriesCreationData: TimelineBlockchainEntryCreation[] =
      selectedAssets.map((asset) => ({
        ...asset,
        source,
      }));

    axios
      .post<{
        createdEntries: TimelineEntry[];
        successfullyFetchedDates: number;
      }>(ENTRY_ENTRIES_ROUTE, entriesCreationData)
      .then((response) => {
        const { createdEntries, successfullyFetchedDates } = response.data;
        const parsedCreatedEntries = parseEntryDates(createdEntries);

        if (successfullyFetchedDates < entriesCreationData.length) {
          toast.info("Failed to be retrieve mint date for some artworks", {
            description: "You can try again inside the artwork edit panel",
          });
        } else if (parsedCreatedEntries.length < entriesCreationData.length) {
          toast.info("Some artworks failed to be saved.");
        } else {
          toast.success("All artworks saved!");
        }

        //Update the users timeline context with the new entry
        setUser((prevUser) => {
          if (!prevUser) return prevUser;

          const prevTimeline = prevUser[timelineKey] || [];

          //TODO-improvement - insert all entries directly into their slot (since they are all the same date here)
          const newTimeline = sortTimeline([
            ...prevTimeline,
            ...parsedCreatedEntries,
          ]);

          return {
            ...prevUser,
            [timelineKey]: newTimeline,
          };
        });

        onSave?.();
        handleOpenChange(false);
      })
      .catch((error) => {
        toast.error(`Failed to create new ${TIMELINE_ENTRY_LABEL.capFullPlural}.`);
        handleClientError({
          error,
          location: "AddBlockchainEntries_handleAssetsAdd",
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
          <Button variant="outline" type="button">
            <P className="hidden md:block">Add minted artworks</P>
            <ImagesIcon />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="lg:max-w-4xl h-full flex flex-col gap-2">
        <DialogHeader className="flex-row justify-between items-center">
          <DialogTitle className="w-fit">
            Select minted artworks
          </DialogTitle>
          <DialogDescription className="sr-only">
            This dialog allows you to add artworks to your timeline.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0">
          <SolanaAssetSelect
            usedAssetAddresses={usedAssetAddresses}
            selectedAssets={selectedAssets}
            setSelectAssets={setSelectedAssets}
            source={source}
            withSearch
            maxSelected={MAX_SELECTED_ASSETS}
            maxSelectWarningBody={
              <div className="flex flex-col gap-y-2 justify-center-safe p-4">
                <P className="text-sm text-center">
                  If these are part of a collection or related works, consider
                  adding them to a gallery instead
                </P>
                <CreateGalleryDialogButton source={source} />
              </div>
            }
            optimisticallySelectedAssets={optimisticallySelectedAssets}
            setOptimisticallySelectedAssets={setOptimisticallySelectedAssets}
          />
        </div>

        {/* lg is the break point where the footer becomes full width (and when the pagination would overlap) */}
        <DialogFooter className="lg:absolute lg:bottom-6 lg:right-6" >
          {/* <DialogFooter className=""> */}
          {/* <div className="flex gap-2 flex-wrap items-center w-full sm:w-fit"> */}
          <Button
            type="button"
            onClick={handleAssetsAdd}
            loading={submitting}
            disabled={
              selectedAssets.length === 0 ||
              optimisticallySelectedAssets.size > 0
            }
            className="w-full lg:w-fit"
          >
            Add Artworks
            <BlockchainAssetEntryIcon />
          </Button>
          {/* </div> */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddBlockchainEntries;