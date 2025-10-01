import { EntrySource, EntryTypes, TimelineEntry } from "@/types/entry";

export const getTimelineKey = (source: EntrySource) => {
  switch (source) {
    // case EntrySource.Curator:
    //   return "curatedTimelineEntries";
    case EntrySource.Collector:
      return "collectedTimelineEntries";
    case EntrySource.Creator:
      return "createdTimelineEntries";
  }
}



/** expects parsed Entries with date as a Date object */
export const sortTimeline = (timelineEntries: TimelineEntry[]) => {
  //sort by date descending (most recent first)
  return timelineEntries.sort((a, b) => {
    return b.date.getTime() - a.date.getTime();
  });
}

export const parseEntryDate = <T extends { date: Date }>(entry: T): T => {
  return {
    ...entry,
    date: new Date(entry.date),
  };
};
/** Parses TimelineEntry dates from the database coming in as ISO strings as Date objects*/
export const parseEntryDates = <T extends { date: Date }>(entries: T[]): T[] => {
  return entries.map(parseEntryDate);
};

/** Takes a basic Date (M/D/Y) and returns a new Date with the current hours, minutes, and seconds for more precise sorting */ 
export const addPreciseCurrentTime = (date: Date) => {
  const preciseDate = new Date(date);
  const now = new Date();
  preciseDate.setHours(
    now.getHours(),
    now.getMinutes(),
    now.getSeconds()
    // avoid milliseconds to prevent conflicts when rearranging entry dates
  );
  return preciseDate;
}
export interface ProcessedEntry {
  entry: TimelineEntry;
  isAssetEntry: boolean;
  entryDate: string;
  entryYear: number;
  showYear: boolean;
  showDate: boolean;
  flipEntry: boolean;
  flipDate: boolean;
}
export const processTimelineEntries = (
  entries: TimelineEntry[],
  cb: (processedEntry: ProcessedEntry) => React.ReactNode
) => {
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
    });

    const entryYear = entry.date.getFullYear();
    const showYear = entryYear !== lastYear; // Show year only if it's different from the last one
    if (showYear) lastYear = entryYear; // Update the lastYear

    const showDate = showYear || (entryDate !== lastDate); // Show date only if it's different from the last one
    if (showDate) {
      lastDate = entryDate; // Update the lastDate
      dateIndex++;
    }

    if (isAssetEntry) assetIndex++;

    const flipEntry = assetIndex % 2 === 1; // Only track asset entries
    const flipDate = dateIndex % 2 === 1; // Flip every other date

    return cb({
      entry,
      isAssetEntry,
      entryDate,
      entryYear,
      showYear,
      showDate,
      flipEntry,
      flipDate,
    });
  });
}