"use client";

import { EntrySource, EntryTypes, TimelineEntry } from "@/types/entry";
import { FC, Fragment } from "react";
import { H2, P } from "@/components/typography/Typography";
import { cn } from "@/utils/ui-utils";
import { EntryBaseProps } from "./EntryBase";

interface TimelineBaseProps {
  source: EntrySource;
  createdTimelineEntries?: TimelineEntry[];
  collectedTimelineEntries?: TimelineEntry[];
  EntryComponent: React.FC<EntryBaseProps>;
}

const TimelineBase: FC<TimelineBaseProps> = ({ source, collectedTimelineEntries, createdTimelineEntries, EntryComponent}) => {

  const timelinesMap = {
    [EntrySource.Creator]: createdTimelineEntries,
    [EntrySource.Collector]: collectedTimelineEntries,
  };

  const entries = timelinesMap[source] || [];

  const renderEntries = () => {
    let assetIndex = 0;
    let dateIndex = 0;
    let lastDate: string | null = null;
    let lastYear: number | null = null;

    return entries.map((entry) => {
      const isAssetEntry =
        entry.entryType === EntryTypes.BlockchainAsset ||
        entry.entryType === EntryTypes.UserAsset;

      // Format the date 
      const entryDate = entry.date.toLocaleString(undefined, {
        month: "long",
        day: "numeric",
      });

      const entryYear = entry.date.getFullYear();

      const showDate = entryDate !== lastDate; // Show date only if it's different from the last one
      if (showDate) {
        lastDate = entryDate; // Update the lastDate
        dateIndex++;
      }
      const showYear = entryYear !== lastYear; // Show year only if it's different from the last one
      if (showYear) lastYear = entryYear; // Update the lastYear

      if (isAssetEntry) assetIndex++;

      const flipEntry = assetIndex % 2 === 1; // Only track asset entries
      const flipDate = dateIndex % 2 === 1; // Flip every other date
      return (
        <Fragment key={String(entry._id)}>
          {showYear && (
            <H2 className="w-fit relative left-1/2 -translate-x-1/2 bg-background p-2 text-muted-foreground">
              {lastYear}
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
                <div className="z-0 h-px w-4 border-2 border-dashed border-muted" />
                <P className={cn("text-lg text-muted-foreground px-2")}>
                  {entryDate}
                </P>
              </div>
            </div>
          )}

          <EntryComponent entry={entry} flip={flipEntry} />
        </Fragment>
      );
    });
  };

  return (
    <div className="relative pb-8">
      <div className="z-0 h-full w-px absolute top-0 left-1/2 -translate-x-1/2 border-muted border-2 border-dashed" />
      <div className="relative flex flex-col space-y-6">
        {renderEntries()}
      </div>
    </div>
  );
};

export default TimelineBase;
