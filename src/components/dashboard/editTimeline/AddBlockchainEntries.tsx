"use client";

import SolanaAssetSelect from "@/components/assets/SolanaAssetSelect";
import { P } from "@/components/typography/Typography";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { EDIT_GALLERIES } from "@/constants/clientRoutes";
import { ENTRY_ENTRIES_ROUTE } from "@/constants/serverRoutes";
import { useUser } from "@/context/UserProvider";
import { ParsedBlockChainAsset } from "@/types/asset";
import { EntrySource, EntryTypes, TimelineEntry } from "@/types/entry";
import { handleClientError } from "@/utils/handleError";
import { addPreciseCurrentTime, getTimelineKey, parseEntryDates, sortTimeline } from "@/utils/timeline";
import { cn } from "@/utils/ui-utils";
import axios from "axios";
import { format } from "date-fns";
import { CalendarIcon, CpuIcon, ImagesIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { FC, useMemo, useState } from "react";
import { toast } from "sonner";
import CreateGalleryDialogButton from "../editGalleries/CreateGalleryDialog";

interface AddBlockchainEntriesProps {
  source: EntrySource;
} 
const AddBlockchainEntries: FC<AddBlockchainEntriesProps> = ({ source }) => { 
  const { setUser, user } = useUser();
  const router = useRouter();

  const [selectedAssets, setSelectedAssets] = useState<ParsedBlockChainAsset[]>([]);
  const [pickedDate, setPickedDate] = useState<Date>(new Date());
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
    setPickedDate(new Date());
  }

  const handleOpenChange = (open: boolean) => { 
    setOpen(open);
    if (!open) handleClear();
  }
  
  const handleAssetsAdd = async () => { 
    setSubmitting(true)

    const preciseTime = addPreciseCurrentTime(pickedDate);

    const entriesCreationData = selectedAssets.map((asset) => ({
      ...asset,
      date: preciseTime,
      source
    }));

    axios
      .post<{ createdEntries: TimelineEntry[] }>(ENTRY_ENTRIES_ROUTE, entriesCreationData)
      .then((response) => {
        const { createdEntries } = response.data;
        const parsedCreatedEntries = parseEntryDates(createdEntries);

        if (parsedCreatedEntries.length < entriesCreationData.length) {
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

  const handleNewGalleryCreation = async () => {
    router.push(EDIT_GALLERIES);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <P>Add Blockchain Assets</P>
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
            maxSelected={9}
            maxSelectWarningBody={
              <div className="flex flex-col gap-y-2 justify-center-safe p-4">
                <P className="text-sm">
                  Timelines shine when they stay simple. Try adding these assets
                  to a gallery for a cleaner look.
                </P>
                <CreateGalleryDialogButton source={source} />
              </div>
            }
          />
        </div>

        <DialogFooter className="">
          <div className="flex gap-2 flex-wrap items-center w-full sm:w-fit">
            <Popover>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        " pl-3 text-left font-normal",
                        !pickedDate && "text-muted-foreground",
                        "w-full sm:w-fit"
                      )}
                    >
                      {pickedDate ? (
                        format(pickedDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>

                <TooltipContent>
                  This date determines where the entries are placed in the
                  timeline.
                </TooltipContent>
              </Tooltip>

              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  required
                  mode="single"
                  selected={pickedDate}
                  onSelect={setPickedDate}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  captionLayout="dropdown"
                />
              </PopoverContent>
            </Popover>

            <Button
              type="button"
              onClick={handleAssetsAdd}
              loading={submitting}
              disabled={selectedAssets.length === 0}
              className="w-full sm:w-36"
            >
              Create Entries
              <CpuIcon />
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddBlockchainEntries;