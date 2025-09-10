import { FC } from "react";
import NewEntryForm from "./newEntryForm/NewEntryForm";
import TimelinePreview from "./TimelinePreview";
import { EntrySource } from "@/types/entry";
import RearrangeEntries from "./RearrangeEntries";
import AddBlockchainEntries from "./AddBlockchainEntries";
import { AspectRatioProvider } from "@/context/AspectRatioProvider";

interface EditTimelineProps {
  source: EntrySource;
} 

const EditTimeline: FC<EditTimelineProps> = ({source}) => {
  return (
    <AspectRatioProvider>
      <div className="flex flex-col gap-6">
        <NewEntryForm source={source} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RearrangeEntries source={source} />
          <AddBlockchainEntries source={source} />
        </div>
        <TimelinePreview source={source} />
      </div>
    </AspectRatioProvider>
  );
} 
export default EditTimeline;