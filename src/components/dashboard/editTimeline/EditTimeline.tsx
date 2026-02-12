"use client";

import { editTimelineSourceAtom } from "@/atoms/dashboard";
import { PAGE_PADDING_X } from "@/components/general/PageContainer";
import EditTimelineSettingsForm from "@/components/dashboard/editTimeline/editTimelineSettingsForm/EditTimelineSettingsForm";
import { TimelineSelect } from "@/components/timeline/TimelineSelect";
import { useUser } from "@/context/UserProvider";
import { TIMELINE_ENTRY_LABEL } from "@/textCopy/mainCopy";
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
        <div className={PAGE_PADDING_X}>
          <div className="relative">
            <div className="absolute left-1/2 -translate-x-1/2 top-4 z-20">
              <EditTimelineSettingsForm buttonClassName="shadow-md" />
            </div>
            <NewEntryFormButton
              source={source}
              buttonVariant="outline"
              buttonClassName="h-40 rounded-lg mb-10"
              buttonText={`Add your first ${TIMELINE_ENTRY_LABEL.fullPlural}!`}
            />
          </div>
        </div>
      ) : (
        <TimelineSelect
          user={user}
          EntryComponent={EditableEntry}
          tabValue={tabValue}
          setTabValue={setTabValue}
          topCenterOverlay={<EditTimelineSettingsForm buttonClassName="shadow-md" />}
        />
      )}
    </div>
  );
} 
export default EditTimeline;

