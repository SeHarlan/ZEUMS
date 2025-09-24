import { EntrySource, TimelineEntry } from "@/types/entry";

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
