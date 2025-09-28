"use client";

import { P } from "@/components/typography/Typography";
import { Button } from "@/components/ui/button";
import { ArrowDownUpIcon, GripVerticalIcon } from "lucide-react";
import { FC,  useMemo, useState } from "react";
import { EntrySource, EntryTypes, TimelineEntry, TimelineEntryDateUpdate } from "@/types/entry";
import MediaThumbnail from "@/components/media/MediaThumbnail";
import { useUser } from "@/context/UserProvider";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/utils/ui-utils";
import ScrollableDialog from "@/components/general/ScrollableDialog";
import axios from "axios";
import { ENTRY_DATES_ROUTE } from "@/constants/serverRoutes";
import { toast } from "sonner";
import { handleClientError } from "@/utils/handleError";
import { getTimelineKey, parseEntryDates, sortTimeline } from "@/utils/timeline";

interface RearrangeEntriesProps { 
  source: EntrySource;
}
const RearrangeEntries: FC<RearrangeEntriesProps> = ({source}) => {
  const { user, setUser } = useUser();

  const [submitting, setSubmitting] = useState(false);
  const [rearrangedEntries, setRearrangedEntries] = useState<TimelineEntry[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const timelineKey = getTimelineKey(source);

  const originalEntries = useMemo(() => {
    const timelinesMap = {
      [EntrySource.Creator]: user?.createdTimelineEntries,
      [EntrySource.Collector]: user?.collectedTimelineEntries,
    };
    return timelinesMap[source] || [];
  }, [source, user?.createdTimelineEntries, user?.collectedTimelineEntries]);

  const handleOpenChange = (open: boolean) => { 
    setDialogOpen(open);
    if (open) {
      // Reset rearranged entries when dialog opens
      setRearrangedEntries([...originalEntries]);
    }
  }

  const saveRearrangement = async () => {
    // filter to just entries with changed dates
    const originalTimes = new Map(
      originalEntries.map((e) => [e._id.toString(), e.date.getTime()])
    );

    const updatedEntries = rearrangedEntries.filter((entry) => {
      const originalTime = originalTimes.get(entry._id.toString());
      if (originalTime == null) return false;
      return entry.date.getTime() !== originalTime;
    });

    // no changes Made
    if (!updatedEntries.length) {
      setDialogOpen(false);
      return
    }

    const updatesPayload : TimelineEntryDateUpdate[] = updatedEntries.map((e) => ({
      _id: e._id,
      date: e.date,
    }));

    setSubmitting(true);

    axios
      .patch<{ updatedEntryDates: TimelineEntryDateUpdate[] }>(ENTRY_DATES_ROUTE, updatesPayload)
      .then((response) => {
        const { updatedEntryDates } = response.data;
        const parsedUpdatedEntryDates = parseEntryDates(updatedEntryDates);

        if (parsedUpdatedEntryDates.length < updatesPayload.length) {
          toast.info("Some entry positions could not be updated.");
        } else {
          toast.success("Entry positions updated!");
        }

        //Update the users timeline context with the updated dates
        setUser((prevUser) => {
          if (!prevUser) return prevUser;

          const prevTimeline = prevUser[timelineKey] || [];

          // Create a Map for lookup 
          const updatedDatesMap = new Map(
            parsedUpdatedEntryDates.map((entry) => [entry._id, entry.date])
          );

          // Update entries
          const updatedTimeline = prevTimeline.map((entry) => {
            const newDate = updatedDatesMap.get(entry._id);
            return newDate ? { ...entry, date: newDate } : entry;
          });

          const newTimeline = sortTimeline(updatedTimeline);
          
          return {
            ...prevUser,
            [timelineKey]: newTimeline,
          };
        });

        setDialogOpen(false);
      })
      .catch((error) => {
        toast.error("Failed to update entry positions.");
        handleClientError({
          error,
          location: "RearrangeEntries_onSubmit",
        });
      })
      .finally(() => {
        setSubmitting(false);
      });
    
  };

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId !== overId) {
      setRearrangedEntries((entries) => {
        // Find the indices of the dragged item and drop target
        const oldIndex = entries.findIndex(
          (entry) => entry._id.toString() === activeId
        );
        const newIndex = entries.findIndex(
          (entry) => entry._id.toString() === overId
        );

        const moved = arrayMove(entries, oldIndex, newIndex);

        //update the date of the moved entry to be between the entries before and after it
        const recentEntry = moved[newIndex - 1] ?? null; // above (more recent)
        const olderEntry = moved[newIndex + 1] ?? null; // below (older)

        const nowTime = Date.now();
        const recentTime = recentEntry ? recentEntry.date.getTime() : nowTime;
        const olderTime = olderEntry
          ? olderEntry.date.getTime()
          : Number.NEGATIVE_INFINITY;

        //TODO: handle edge case where time in milliseconds end up the same 
        
        // 60 seconds before the more recent entry to place it below but on the same day
        const beforeRecentTime = recentTime - 60_000;

        let activeTime = beforeRecentTime;



        if (!recentEntry) {
          // Dropped at the very top -> make it "now"
          activeTime = nowTime;
        } else if (olderEntry && beforeRecentTime <= olderTime) {
          // Would fall below the next entry; place midway
          activeTime = Math.floor((recentTime + olderTime) / 2);
        }

        moved[newIndex] = {
          ...moved[newIndex],
          date: new Date(activeTime),
        };

        return moved;
        // ...existing code...
      });
    }
  }

  return (
    <ScrollableDialog
      title="Rearrange Entries"
      description="Quickly update entry dates by changing their position."
      open={dialogOpen}
      onOpenChange={handleOpenChange}
      trigger={
        <Button variant="outline">
          <P>Rearrange Entries</P>
          <ArrowDownUpIcon />
        </Button>
      }
      footerContent={
        <Button type="button" className="w-full sm:w-16" onClick={saveRearrangement} loading={submitting} disabled={!rearrangedEntries.length}>
          Save
        </Button>
      }
    >
      <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
        <SortableContext
          items={rearrangedEntries.map((entry) => entry._id.toString())}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-4">
            {rearrangedEntries.length
              ? rearrangedEntries.map((entry) => (
              <SortableEntry key={entry._id.toString()} entry={entry} />
              ))
              : <P className="text-center">Add some entries to get started!</P>
            }
          </div>
        </SortableContext>
      </DndContext>
    </ScrollableDialog>
  );
}

export default RearrangeEntries;

interface SortableEntryProps { 
  entry: TimelineEntry
}
const SortableEntry: FC<SortableEntryProps> = ({entry}) => { 
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: entry._id.toString(),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  
  
  const thumbnail = entry.entryType === EntryTypes.BlockchainAsset || entry.entryType === EntryTypes.UserAsset
    ? <div className="flex-shrink-0 w-10 h-10">
      <MediaThumbnail media={entry.media} alt={entry.title} rounding="rounded-sm" />
    </div>
    : null

  const useTitle = Boolean(entry.title);
  const text = entry.title || entry.description || "Untitled Entry";

  return (
    <div
      className="relative z-10 flex items-center gap-4 w-full h-14 py-2 pl-2 pr-4 rounded-md bg-muted cursor-grab active:cursor-grabbing"
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    >
      <GripVerticalIcon className="flex-shrink-0" />
      {thumbnail}
      <P className={cn(
        "flex-1 line-clamp-1 w-full",
        useTitle ? "text-lg font-bold" : ""
      )}
      >{text}</P>
      <P className="flex-shrink-0 text-sm text-muted-foreground">
        {entry.date.toLocaleDateString()}
      </P>
    </div>
  );
}