"use client";

import { H2, P } from "@/components/typography/Typography";
import { useBreakpoints } from "@/context/ResponsiveProvider";
import { EntryTypes, isGalleryEntry, isMediaEntry, isTextEntry, TimelineEntry } from "@/types/entry";
import { ProcessedEntry } from "@/utils/timeline";
import { cn, getMainScrollAreaViewport } from "@/utils/ui-utils";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { FC, useCallback, useEffect, useMemo, useRef } from "react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { EntryBaseProps } from "./EntryBase";

interface TimelineBaseProps {
  entries: TimelineEntry[];
  EntryComponent: React.FC<EntryBaseProps>;
  hideDates?: boolean;
}

const TimelineBase: FC<TimelineBaseProps> = ({ entries, EntryComponent, hideDates = false}) => {
  const {isMd} = useBreakpoints()
  // Process entries to get metadata for virtualization
  const processedEntries = useMemo(() => {
    let assetIndex = 0;
    let dateIndex = 0;
    let lastDate: string | null = null;
    let lastYear: number | null = null;

    return entries.map((entry) => {
      const entryDate = entry.date.toLocaleString(undefined, {
        month: "long",
        day: "numeric",
      });

      const entryYear = entry.date.getFullYear();
      const showYear = hideDates ? false : (entryYear !== lastYear);
      if (showYear) lastYear = entryYear;

      const showDate = hideDates ? false : (showYear || (entryDate !== lastDate));
      if (showDate) {
        lastDate = entryDate;
        dateIndex++;
      }

      const isAssetEntry = entry.entryType === EntryTypes.BlockchainAsset || entry.entryType === EntryTypes.UserAsset;
      const isGalleryEntry = entry.entryType === EntryTypes.Gallery;
      if (isAssetEntry || isGalleryEntry) assetIndex++;

      const flipEntry = assetIndex % 2 === 1;
      const flipDate = dateIndex % 2 === 1;

      return {
        entry,
        isAssetEntry,
        isGalleryEntry,
        entryDate,
        entryYear,
        showYear,
        showDate,
        flipEntry,
        flipDate,
      } as ProcessedEntry;
    });
  }, [entries, hideDates]);

  const BOTTOM_PADDING = hideDates ? 160 : 120;
  // const datesHeight = hideDates ? 0 : 120;

  const parentElementRef = useRef<HTMLDivElement>(null);
  const scrollingRef = useRef<'top' | 'bottom' | null>(null);
  const isProgrammaticScrollRef = useRef<boolean>(false);

  const estimateSize = useCallback((index: number) => {
    const entry = entries[index];
    const containerWidth = parentElementRef.current?.clientWidth || 1200;
    const imageWidth = isMd
      ? containerWidth / 2 //height of image, image width is half the container 
      : containerWidth;
    const textHeight = 300;


    let totalHeight = BOTTOM_PADDING;
    
    if (isMediaEntry(entry)) {
      const ratio = entry.media.aspectRatio || 1;
      totalHeight += imageWidth / ratio;
    }

    if(isGalleryEntry(entry)) {
      const galleryRatio = 2 / 3; //generally two rows of a gallery will be slightly taller than width
      totalHeight += imageWidth / galleryRatio;
    }

       
    if(isTextEntry(entry) || !isMd) {
      //on mobile text will be stacked below images
      totalHeight += textHeight;
    }

    return totalHeight;
  }, [entries, isMd, BOTTOM_PADDING]);

  const entryVirtualizer = useVirtualizer({
    count: processedEntries.length,
    getScrollElement: getMainScrollAreaViewport,
    // Important: use a stable key per entry so React doesn't reuse
    // video components after insert/delete operations.
    getItemKey: (index) => String(processedEntries[index]?.entry?._id ?? index),
    estimateSize: estimateSize,
    overscan: 2,
    useAnimationFrameWithResizeObserver: true,
    // debug: process.env.NODE_ENV === "development",
  });

  // Cancel auto-scroll if user manually scrolls (using wheel/touch events instead of scroll events)
  useEffect(() => {
    const scrollElement = getMainScrollAreaViewport();
    if (!scrollElement) return;

    const handleUserScroll = () => {
      // If we're auto-scrolling and user interacts, cancel it
      if (scrollingRef.current && !isProgrammaticScrollRef.current) {
        scrollingRef.current = null;
      }
    };

    // Listen to wheel events (mouse/trackpad scrolling)
    scrollElement.addEventListener('wheel', handleUserScroll, { passive: true });
    
    // Listen to touch events (mobile scrolling)
    const handleTouchMove = () => {
      if (scrollingRef.current && !isProgrammaticScrollRef.current) {
        scrollingRef.current = null;
      }
    };
    
    scrollElement.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      scrollElement.removeEventListener('wheel', handleUserScroll);
      scrollElement.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  const handleScrollToBottom = useCallback(() => {
    const scrollElement = getMainScrollAreaViewport();
    if (!scrollElement || scrollingRef.current) return;

    scrollingRef.current = 'bottom';
    
    const scroll = () => {
      if (!scrollElement || scrollingRef.current !== 'bottom') return;

      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      
      // Validate dimensions
      if (scrollHeight <= 0 || clientHeight <= 0) {
        scrollingRef.current = null;
        return;
      }

      const maxScrollTop = Math.max(0, scrollHeight - clientHeight);
      const remainingDistance = Math.max(0, maxScrollTop - scrollTop);
      const threshold = 15; // More generous threshold to account for edge cases

      // Check if we've reached the bottom (with generous margin)
      if (remainingDistance <= threshold) {
        isProgrammaticScrollRef.current = true;
        scrollElement.scrollTop = maxScrollTop;
        isProgrammaticScrollRef.current = false;
        scrollingRef.current = null;
        return;
      }

      // Smooth scroll with enhanced deceleration at the end
      // Create a deceleration factor that increases as we approach the target
      const decelerationFactor = Math.max(0.15, Math.min(remainingDistance / 200, 1)); // Min 0.15 to ensure progress
      const normalizedDistance = Math.min(remainingDistance / 2000, 1);
      // Ease-in-out cubic: smooth acceleration and deceleration
      const easeInOutCubic = normalizedDistance < 0.5
        ? 4 * normalizedDistance * normalizedDistance * normalizedDistance
        : 1 - Math.pow(-2 * normalizedDistance + 2, 3) / 2;
      
      // Apply deceleration factor to slow down more at the end, with minimum increment
      const baseIncrement = 15;
      const calculatedIncrement = (baseIncrement + (remainingDistance * 0.01 * (1 - easeInOutCubic * 0.5))) * decelerationFactor;
      const scrollIncrement = Math.max(2, calculatedIncrement); // Ensure at least 2px progress

      const newScrollTop = Math.min(scrollTop + scrollIncrement, maxScrollTop);
      isProgrammaticScrollRef.current = true;
      scrollElement.scrollTop = newScrollTop;
      isProgrammaticScrollRef.current = false;
      requestAnimationFrame(scroll);
    };

    requestAnimationFrame(scroll);
  }, []);

  const handleScrollToTop = useCallback(() => {
    const scrollElement = getMainScrollAreaViewport();
    if (!scrollElement || scrollingRef.current) return;

    scrollingRef.current = "top";

    // Calculate the target scroll position (top of parent element with padding)
    const TOP_PADDING = 140;
    const currentScrollTop = scrollElement.scrollTop;
    let targetScrollTop = 0;
    const threshold = 15; // More generous threshold to account for edge cases

    if (parentElementRef.current && scrollElement) {
      const parentRect = parentElementRef.current.getBoundingClientRect();
      const scrollRect = scrollElement.getBoundingClientRect();
      // Calculate offset of parent element relative to scroll container, minus padding
      targetScrollTop = Math.max(
        0,
        currentScrollTop + (parentRect.top - scrollRect.top) - TOP_PADDING
      );
    }

    // Ensure target is valid (not greater than current, since we're scrolling up)
    targetScrollTop = Math.min(targetScrollTop, currentScrollTop);

      // Early exit if already at target
      if (currentScrollTop - targetScrollTop <= threshold) {
        isProgrammaticScrollRef.current = true;
        scrollElement.scrollTop = targetScrollTop;
        isProgrammaticScrollRef.current = false;
        scrollingRef.current = null;
        return;
      }

    const scroll = () => {
      if (!scrollElement || scrollingRef.current !== "top") return;

      const { scrollTop } = scrollElement;
      const remainingDistance = Math.max(0, scrollTop - targetScrollTop); // Ensure non-negative

      // Check if we've reached the target
      if (remainingDistance <= threshold) {
        isProgrammaticScrollRef.current = true;
        scrollElement.scrollTop = targetScrollTop;
        isProgrammaticScrollRef.current = false;
        scrollingRef.current = null;
        return;
      }

      // Smooth scroll with enhanced deceleration at the end
      // Create a deceleration factor that increases as we approach the target
      const decelerationFactor = Math.max(
        0.15,
        Math.min(remainingDistance / 200, 1)
      ); // Min 0.15 to ensure progress
      const normalizedDistance = Math.min(remainingDistance / 2000, 1);
      // Ease-in-out cubic: smooth acceleration and deceleration
      const easeInOutCubic =
        normalizedDistance < 0.5
          ? 4 * normalizedDistance * normalizedDistance * normalizedDistance
          : 1 - Math.pow(-2 * normalizedDistance + 2, 3) / 2;

      // Apply deceleration factor with minimum increment guarantee
      const baseIncrement = 15;
      const calculatedIncrement =
        (baseIncrement +
          remainingDistance * 0.01 * (1 - easeInOutCubic * 0.5)) *
        decelerationFactor;
      const scrollIncrement = Math.max(2, calculatedIncrement); // Ensure at least 2px progress

      const newScrollTop = Math.max(
        targetScrollTop,
        scrollTop - scrollIncrement
      );
      isProgrammaticScrollRef.current = true;
      scrollElement.scrollTop = newScrollTop;
      isProgrammaticScrollRef.current = false;
      requestAnimationFrame(scroll);
    };

    requestAnimationFrame(scroll);
  }, []);

  const renderEntry = (processedEntry: ProcessedEntry, index: number) => {
    const {
      entry,
      entryDate,
      entryYear,
      showYear,
      showDate,
      flipEntry,
      flipDate,
    } = processedEntry;

    const id = index === 0 ? "first-entry" : index === processedEntries.length - 1 ? "last-entry" : undefined;
    return (
      <div className="space-y-4" id={id}>
        {showYear && (
           <H2 className="w-fit mx-auto bg-muted px-6 py-2 rounded-md text-muted-foreground shadow">
             {entryYear}
           </H2>
         )}
        {showDate && (
          <div className="flex justify-center">
            <div
              className={cn(
                "flex items-center",
                flipDate
                ? "-translate-x-1/2 flex-row-reverse"
                : "translate-x-1/2"
              )}
              >
           
              <div className="z-0 h-px w-5 border-2 border-dashed border-muted" />
              <P className={cn("text-lg text-muted-foreground px-2")}>
                {entryDate}
              </P>
            </div>
          </div>
        )}

        {/* Force stable identity per entry to avoid DOM reuse issues (e.g. <video>) */}
        <EntryComponent key={entry._id.toString()} entry={entry} flip={flipEntry} />
      </div>
    );
  };

  return (
    <div className="pb-4 space-y-2">
      <Button
        className="mx-auto flex font-serif text-muted-foreground"
        variant="link"
        onClick={handleScrollToBottom}
      >
        Start at the beginning <ArrowDownIcon />
      </Button>
      <div className="relative pb-8 mb-0">
        {!hideDates && (
          <div className="z-0 h-full w-px absolute top-0 left-1/2 -translate-x-1/2 border-muted border-2 border-dashed" />
        )}
        <div
          className={cn(
            "relative flex flex-col pb-10",
            hideDates ? "pt-20" : "pt-10"
          )}
          style={{
            height: `${entryVirtualizer.getTotalSize()}px`,
          }}
          ref={parentElementRef}
        >
          {entryVirtualizer.getVirtualItems().map((virtualItem) => {
            const processedEntry = processedEntries[virtualItem.index];
            if (!processedEntry) return null;

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
                  paddingBottom: BOTTOM_PADDING,
                }}
              >
                {renderEntry(processedEntry, virtualItem.index)}
              </div>
            );
          })}
        </div>
      </div>
      <Separator />
      <Button
        className="mx-auto flex font-serif text-muted-foreground"
        variant="link"
        onClick={handleScrollToTop}
      >
        Back to the top <ArrowUpIcon />
      </Button>
    </div>
  );
};

export default TimelineBase;
