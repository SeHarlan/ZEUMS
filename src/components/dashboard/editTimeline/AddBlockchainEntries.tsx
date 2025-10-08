"use client";

import SolanaAssetSelect from "@/components/assets/SolanaAssetSelect";
import { P } from "@/components/typography/Typography";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ENTRY_ENTRIES_ROUTE } from "@/constants/serverRoutes";
import { useUser } from "@/context/UserProvider";
import { ParsedBlockChainAsset } from "@/types/asset";
import { EntrySource, EntryTypes, TimelineBlockchainEntryCreation, TimelineEntry } from "@/types/entry";
import { handleClientError } from "@/utils/handleError";
import { getTimelineKey, parseEntryDates, sortTimeline } from "@/utils/timeline";
import axios from "axios";
import { CpuIcon, ImagesIcon } from "lucide-react";
import { FC, useMemo, useState } from "react";
import { toast } from "sonner";
import CreateGalleryDialogButton from "../editGalleries/CreateGalleryDialog";

export const MAX_SELECTED_ASSETS = 9;
interface AddBlockchainEntriesProps {
  source: EntrySource;
} 
const AddBlockchainEntries: FC<AddBlockchainEntriesProps> = ({ source }) => { 
  const { setUser, user } = useUser();

  const [selectedAssets, setSelectedAssets] = useState<ParsedBlockChainAsset[]>([]);
  const [optimisticallySelectedAssets, setOptimisticallySelectedAssets] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false)
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
  }

  const handleOpenChange = (open: boolean) => { 
    setOpen(open);
    if (!open) handleClear();
  }
  
  const handleAssetsAdd = async () => { 
    setSubmitting(true)

    const entriesCreationData: TimelineBlockchainEntryCreation[] =
      selectedAssets.map((asset) => ({
        ...asset,
        source,
      }));

    axios
      .post<{ createdEntries: TimelineEntry[], successfullyFetchedDates: number }>(ENTRY_ENTRIES_ROUTE, entriesCreationData)
      .then((response) => {
        const { createdEntries, successfullyFetchedDates } = response.data;
        const parsedCreatedEntries = parseEntryDates(createdEntries);

        if (successfullyFetchedDates < entriesCreationData.length) {
          toast.info("Failed to be retrieve mint date for some entries", {
            description: "You can try again inside the entries edit panel",
          });
        } else if (parsedCreatedEntries.length < entriesCreationData.length) {
          toast.info("Some entries failed to be saved.");
        } else {
          toast.success("All entries saved!");
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

        handleOpenChange(false);
      })
      .catch((error) => {
        toast.error("Failed to create new entries.");
        handleClientError({
          error,
          location: "AddBlockchainEntries_handleAssetsAdd",
        });
      })
      .finally(() => {
        setSubmitting(false);
      });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <P className="hidden md:block">Add Blockchain Assets</P>
          <ImagesIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className="lg:max-w-4xl h-full flex flex-col">
        <DialogHeader className="flex-row justify-between items-center">
          <DialogTitle className="w-fit">Select Blockchain Assets</DialogTitle>
          <DialogDescription className="sr-only">
            This dialog allows you to select blockchain assets to add to your
            timeline.
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
                <P className="text-sm">
                  Timelines shine when they stay simple. Try adding these assets
                  to a gallery for a cleaner look.
                </P>
                <CreateGalleryDialogButton source={source} />
              </div>
            }
            optimisticallySelectedAssets={optimisticallySelectedAssets}
            setOptimisticallySelectedAssets={setOptimisticallySelectedAssets}
          />
        </div>

             {/* sm is the break point where the footer becomes full width (and when the pagination would overlap) */}
          <DialogFooter className="sm:absolute sm:bottom-6 sm:right-6">
        {/* <DialogFooter className=""> */}
          {/* <div className="flex gap-2 flex-wrap items-center w-full sm:w-fit"> */}
            <Button
              type="button"
              onClick={handleAssetsAdd}
              loading={submitting}
              disabled={selectedAssets.length === 0 || optimisticallySelectedAssets.size > 0}
            >
              Create Entries
              <CpuIcon />
            </Button>
          {/* </div> */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddBlockchainEntries;