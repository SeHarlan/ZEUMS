"use client";

import { editTimelineSourceAtom } from "@/atoms/dashboard";
import { TimelineSelect } from "@/components/timeline/TimelineSelect";
import { useUser } from "@/context/UserProvider";
import { EntrySource } from "@/types/entry";
import { useAtom } from "jotai/react";
import { FC } from "react";
import EditableEntry from "./EditableEntry";
import { EditTimelineBar } from "./EditTimelineBar";
import NewEntryFormButton from "./newEntryForm/NewEntryForm";


const EditTimeline: FC = () => {
  const { user } = useUser();
  const [tabValue, setTabValue] = useAtom(editTimelineSourceAtom);

  //TODO refactor to use selectors for entries based on source atom and user
  const source = tabValue;
  const timelinesMap = {
    [EntrySource.Creator]: user?.createdTimelineEntries,
    [EntrySource.Collector]: user?.collectedTimelineEntries,
  };
  const entries = timelinesMap[source] || [];

  return (
    <div className="relative mb-2 md:mb-10">
      <EditTimelineBar />
      {entries.length === 0 ? (
        <NewEntryFormButton
          source={source}
          buttonVariant="outline"
          buttonClassName="h-40 rounded-lg mb-10"
          buttonText="Add your first content!"
        />
      ) : (
        <TimelineSelect
          user={user}
          EntryComponent={EditableEntry}
          tabValue={tabValue}
          setTabValue={setTabValue}
        />
      )}
    </div>
  );
} 
export default EditTimeline;

