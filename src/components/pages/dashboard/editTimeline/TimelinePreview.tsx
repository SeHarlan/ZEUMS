"use client";

import { useUser } from "@/context/UserProvider";
import { EntrySource } from "@/types/entry";
import { FC } from "react";
import EntryPreview from "./EditableEntry";
import EditEntryContextProvider from "@/context/EditEntryProvider";
import TimelineBase from "@/components/timeline/TimelineBase";

interface TimelinePreviewProps {
  source: EntrySource;
} 

const TimelinePreview: FC<TimelinePreviewProps> = ({source}) => {
  const { user } = useUser();
  return (
    <EditEntryContextProvider>
      <TimelineBase
        source={source}
        createdTimelineEntries={user?.createdTimelineEntries}
        collectedTimelineEntries={user?.collectedTimelineEntries}
        EntryComponent={EntryPreview}
      />
    </EditEntryContextProvider>
  );
}

export default TimelinePreview;