"use client";

import { rearrangeEntriesDrawerOpenAtom } from "@/atoms/dashboard";
import SideDrawer from "@/components/general/SideDrawer";
import MediaThumbnail from "@/components/media/MediaThumbnail";
import { P } from "@/components/typography/Typography";
import { Button } from "@/components/ui/button";
import { ENTRY_DATES_ROUTE } from "@/constants/serverRoutes";
import { useUser } from "@/context/UserProvider";
import { TIMELINE_ENTRY_LABEL } from "@/textCopy/mainCopy";
import { EntrySource, isGalleryEntry, isMediaEntry, TimelineEntry, TimelineEntryDateUpdate } from "@/types/entry";
import { isMediaGalleryItem } from "@/types/galleryItem";
import { handleClientError } from "@/utils/handleError";
import { getBlobUrlBuilderPropsFromItemOrEntry } from "@/utils/media";
import { getTimelineKey, sortTimeline } from "@/utils/timeline";
import { cn, getScrollAreaViewport } from "@/utils/ui-utils";
import { closestCenter, DndContext, DragEndEvent, DragMoveEvent } from "@dnd-kit/core";
import {
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useVirtualizer } from "@tanstack/react-virtual";
import axios from "axios";
import { useAtom } from "jotai";
import { ArrowDownUpIcon, GripVerticalIcon } from "lucide-react";
import type { BulkWriteResult } from "mongodb";
import { FC, forwardRef, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import NewEntryFormButton from "./newEntryForm/NewEntryForm";


interface HoverData {
  id: string;
  side: "above" | "down";
}

const REARRANGE_ENTRIES_SCROLL_AREA_ID = "rearrange-entries-scroll-area";

interface RearrangeEntriesProps {
  source: EntrySource;
  buttonClassName?: string;
  buttonVariant?: "default" | "outline" | "ghost" | "link" | "secondary";
  buttonText?: string;
  onClick?: () => void;
}
const RearrangeEntries = forwardRef<HTMLButtonElement, RearrangeEntriesProps>(({
  source,
  buttonClassName,
  buttonVariant = "default",
  buttonText = "Rearrange Entries",
  onClick,
}, ref) => {
  const { user, setUser } = useUser();

  const [submitting, setSubmitting] = useState(false);
  const [drawerOpen, setDrawerOpen] = useAtom(rearrangeEntriesDrawerOpenAtom);
  const [hoverData, setHoverData] = useState<HoverData | null>(null);

  const timelineKey = getTimelineKey(source);
  
  const originalEntries = useMemo(() => user?.[timelineKey] || [], [user, timelineKey]);

  const [rearrangedEntries, setRearrangedEntries] = useState<TimelineEntry[]>(originalEntries);
  
  useEffect(() => {
    //when open, sync state to current userEntries
    if (!drawerOpen) return;

    setRearrangedEntries(originalEntries);
  }, [originalEntries, drawerOpen])

  // Entry height: h-14 (56px) + gap-4 (16px) = 72px per entry
  const ENTRY_HEIGHT = 56; // h-14
  const GAP = 16; // gap-4
  
  // eslint-disable-next-line react-hooks/incompatible-library
  const entryVirtualizer = useVirtualizer({
    count: rearrangedEntries.length,
    getScrollElement: () => getScrollAreaViewport(REARRANGE_ENTRIES_SCROLL_AREA_ID),
    estimateSize: () => ENTRY_HEIGHT + GAP,
    overscan: 2,
    useAnimationFrameWithResizeObserver: true,
    // debug: process.env.NODE_ENV === "development",
  });

  // Reset virtualizer when drawer opens
  useEffect(() => {
    if (!drawerOpen) return;
    
    // Wait for the scroll element to be available
    const checkScrollElement = () => {
      const scrollElement = getScrollAreaViewport(REARRANGE_ENTRIES_SCROLL_AREA_ID);
      if (scrollElement) {
        // Scroll to top and trigger remeasure
        scrollElement.scrollTop = 0;
        entryVirtualizer.measure();
      } else {
        // Retry after a short delay if scroll element isn't ready
        requestAnimationFrame(checkScrollElement);
      }
    };
    
    requestAnimationFrame(checkScrollElement);
  }, [drawerOpen, entryVirtualizer]);


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
      setDrawerOpen(false);
      return;
    }

    const updatesPayload: TimelineEntryDateUpdate[] = updatedEntries.map(
      (e) => ({
        _id: e._id.toString(),
        date: e.date,
      })
    );

    setSubmitting(true);

    axios
      .patch<{ bulkWriteResult: BulkWriteResult }>(
        ENTRY_DATES_ROUTE,
        updatesPayload
      )
      .then((response) => {
        const { bulkWriteResult } = response.data;

        if (bulkWriteResult.modifiedCount < updatesPayload.length) {
          toast.info("Some entry positions could not be updated.");
        } else {
          toast.success(`${TIMELINE_ENTRY_LABEL.capFullSingular} positions updated successfully!`);
        }

        //Update the users timeline context with the updated dates
        setUser((prevUser) => {
          if (!prevUser) return prevUser;

          const sortedTimelineEntries = sortTimeline(rearrangedEntries);

          return {
            ...prevUser,
            [timelineKey]: sortedTimelineEntries,
          };
        });

        setDrawerOpen(false);
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

  const getCursorSide = (event: DragMoveEvent): HoverData | null => {
    const { activatorEvent, over, delta } = event;
    if (!over || !(activatorEvent instanceof MouseEvent)) return null;

    const overRect = over.rect;
    const mouseY = activatorEvent.clientY + delta.y;

    // Calculate which side of the over item the cursor is on
    const overCenterY = overRect.top + overRect.height / 2;
    const cursorSide = mouseY < overCenterY ? "above" : "down";
    return { id: over.id.toString(), side: cursorSide };
  };

  const onDragMove = (event: DragMoveEvent) => {
    const cursorSideData = getCursorSide(event);
    if (!cursorSideData) return;
    setHoverData(cursorSideData);
  };

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    setRearrangedEntries((entries) => {
      // Find the indices of the dragged item and drop target
      const oldIndex = entries.findIndex(
        (entry) => entry._id.toString() === activeId
      );
      const newIndex = entries.findIndex(
        (entry) => entry._id.toString() === overId
      );

      //if over itself don't move it but do check positioning and change the date accordingly
      const moved =
        activeId === overId ? entries : arrayMove(entries, oldIndex, newIndex);

      //update the date of the moved entry to be between the entries before and after it
      const aboveEntry = moved[newIndex - 1] ?? null; // above (more recent)
      const belowEntry = moved[newIndex + 1] ?? null; // below (older)

      const nowTime = Date.now();
      const aboveTime = aboveEntry ? aboveEntry.date.getTime() : nowTime;
      const belowTime = belowEntry ? belowEntry.date.getTime() : aboveTime;

      // 60 seconds around entry to place it on the same day
      const isDown = hoverData?.side === "down";
      let activeTime = isDown ? belowTime + 60_000 : aboveTime - 60_000;

      const isBeforeBelow = !isDown && belowEntry && activeTime <= belowTime;
      const isAfterAbove = isDown && aboveEntry && activeTime >= aboveTime;

      if (isBeforeBelow || isAfterAbove) {
        // Would fall below the below/older entry; place midway below
        activeTime = Math.floor((aboveTime + belowTime) / 2);
      }

      moved[newIndex] = {
        ...moved[newIndex],
        date: new Date(activeTime),
      };

      return moved;
    });

    setHoverData(null);
  }

  return (
    <SideDrawer
      scrollAreaId={REARRANGE_ENTRIES_SCROLL_AREA_ID}
      triggerButton={
        <Button
          className={cn("w-full", buttonClassName)}
          variant={buttonVariant}
          ref={ref}
          onClick={onClick}
        >
          <P>{buttonText}</P>
          <ArrowDownUpIcon className="hidden sm:block" />
        </Button>
      }
      open={drawerOpen}
      onOpenChange={setDrawerOpen}
      title={`Rearrange ${TIMELINE_ENTRY_LABEL.capFullPlural}`}
      description={`Quickly change the order and dates of your timeline content`}
      actionButton={
        <Button
          type="button"
          className="w-full"
          onClick={saveRearrangement}
          loading={submitting}
          disabled={!rearrangedEntries.length}
        >
          Save
        </Button>
      }
    >
      <DndContext
        onDragEnd={handleDragEnd}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragMove={onDragMove}
      >
        <SortableContext
          items={rearrangedEntries.map((entry) => entry._id.toString())}
          strategy={verticalListSortingStrategy}
        >
          {rearrangedEntries.length ? (
            <div
              style={{
                height: `${entryVirtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
              className="mt-2"
            >
              {entryVirtualizer.getVirtualItems().map((virtualItem) => {
                const entry = rearrangedEntries[virtualItem.index];
                if (!entry) return null;

                return (
                  <div
                    key={virtualItem.key}
                    data-index={virtualItem.index}
                    ref={entryVirtualizer.measureElement}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      transform: `translateY(${virtualItem.start}px)`,
                      paddingBottom: `${GAP}px`, // gap-4 equivalent
                    }}
                  >
                    <SortableEntry entry={entry} />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 space-y-4 mt-2">
              <P className="text-center ">
                Add some {TIMELINE_ENTRY_LABEL.fullPlural} to get started!
              </P>
              <NewEntryFormButton source={source} buttonVariant="default" />
            </div>
          )}
        </SortableContext>
      </DndContext>
    </SideDrawer>
  );
});

RearrangeEntries.displayName = "RearrangeEntries";

export default RearrangeEntries;

interface SortableEntryProps {
  entry: TimelineEntry;
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

  const item = isMediaEntry(entry)
    ? entry
    : isGalleryEntry(entry) && isMediaGalleryItem(entry.gallery.items?.[0])
      ? entry.gallery.items?.[0]
      : undefined;
  
  const media = item && item.media;
    
  const blobUrlBuilderProps = useMemo(() => {
    return getBlobUrlBuilderPropsFromItemOrEntry(item);
  }, [item]);

  const thumbnail = media ? (
    <div className="shrink-0 w-10 h-10">
      <MediaThumbnail
        objectFit="object-cover"
        media={media}
        alt={entry.title}
        rounding="rounded-sm"
        priority
        blobUrlBuilderProps={blobUrlBuilderProps}
      />
    </div>
  ) : null;

  const useTitle = Boolean(entry.title);
  const text = entry.title || entry.description || `Untitled ${TIMELINE_ENTRY_LABEL.capFullSingular}`;

  return (
    <div
      className="z-10 relative flex items-center gap-4 w-full h-14 py-2 pl-2 pr-4 rounded-md bg-muted cursor-grab active:cursor-grabbing"
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    >
      <GripVerticalIcon className="shrink-0" />
      {thumbnail}
      <P
        className={cn(
          "flex-1 line-clamp-1 w-full",
          useTitle ? "text-lg font-bold" : ""
        )}
      >
        {text}
      </P>
      <P className="shrink-0 text-sm text-muted-foreground">
        {entry.date.toLocaleDateString()}
      </P>
    </div>
  );
}