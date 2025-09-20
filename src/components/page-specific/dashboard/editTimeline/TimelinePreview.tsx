"use client";

import { useUser } from "@/context/UserProvider";
import { EntrySource } from "@/types/entry";
import { FC } from "react";
import EditableEntry from "./EditableEntry";
import EditEntryContextProvider from "@/context/EditEntryProvider";
import TimelineBase from "@/components/timeline/TimelineBase";

interface TimelinePreviewProps {
  source: EntrySource;
} 

const TimelinePreview: FC<TimelinePreviewProps> = ({source}) => {
  const { user } = useUser();

  const timelinesMap = {
    [EntrySource.Creator]: user?.createdTimelineEntries,
    [EntrySource.Collector]: user?.collectedTimelineEntries,
  };
  const entries = timelinesMap[source] || [];
  return (
    <EditEntryContextProvider>
      <TimelineBase
        entries={entries}
        EntryComponent={EditableEntry}
      />
    </EditEntryContextProvider>
  );
}

export default TimelinePreview;