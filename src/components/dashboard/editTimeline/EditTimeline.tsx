"use client";

import { FC } from "react";
import NewEntryFormButton from "./newEntryForm/NewEntryForm";
import { EntrySource } from "@/types/entry";
import RearrangeEntriesButton from "./RearrangeEntries";
import AddBlockchainEntriesButton from "./AddBlockchainEntries";
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
      <NewEntryFormButton source={source} />
      <div className="grid grid-cols-[auto_1fr] md:grid-cols-[1fr_2fr] gap-6">
        <AddBlockchainEntriesButton source={source} />
        <RearrangeEntriesButton source={source} />
      </div>
      {entries.length === 0 ? (
        <NewEntryFormButton
          source={source}
          buttonVariant="outline"
          buttonClassName="h-40"
          buttonText="Create First Entry"
        />
      ) : (
        <TimelineBase entries={entries} EntryComponent={EditableEntry} />
      )}
    </div>
  );
} 
export default EditTimeline;