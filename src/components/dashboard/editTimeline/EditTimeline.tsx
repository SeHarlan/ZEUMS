"use client";

import { FC } from "react";
import NewEntryForm from "./newEntryForm/NewEntryForm";
import { EntrySource } from "@/types/entry";
import RearrangeEntries from "./RearrangeEntries";
import AddBlockchainEntries from "./AddBlockchainEntries";
import { useUser } from "@/context/UserProvider";
import TimelineBase from "@/components/timeline/TimelineBase";
import EditableEntry from "./EditableEntry";

interface EditTimelineProps {
  source: EntrySource;
} 

const EditTimeline: FC<EditTimelineProps> = ({ source }) => {
  const { user } = useUser();

  const timelinesMap = {
    [EntrySource.Creator]: user?.createdTimelineEntries,
    [EntrySource.Collector]: user?.collectedTimelineEntries,
  };
  const entries = timelinesMap[source] || [];
  return (
    <div className="space-y-6">
      <NewEntryForm source={source} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RearrangeEntries source={source} />
        <AddBlockchainEntries source={source} />
      </div>
      <TimelineBase entries={entries} EntryComponent={EditableEntry} />
    </div>
  );
} 
export default EditTimeline;