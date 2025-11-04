import { EntrySource, isEntrySource } from "@/types/entry";
import { PublicUserType } from "@/types/user";
import { getTimelineTabContent } from "@/utils/timeline";
import { cn } from "@/utils/ui-utils";
import { FC } from "react";
import { PAGE_PADDING_X } from "../general/PageContainer";
import { P } from "../typography/Typography";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { EntryBaseProps } from "./EntryBase";
import TimelineBase from "./TimelineBase";

interface TimelineSelectProps {
  user?: PublicUserType | null;
  EntryComponent: React.FC<EntryBaseProps>;
  tabValue?: EntrySource;
  setTabValue?: (value: EntrySource) => void;
}
export const TimelineSelect: FC<TimelineSelectProps> = ({ user, EntryComponent, tabValue, setTabValue }) => { 
  const content = getTimelineTabContent(user);
  
  const handleValueChange = setTabValue ?(value: string) => {
    if (isEntrySource(value)) {
      setTabValue(value);
    }
  } : undefined;

  const getHideDates = (source: EntrySource) => {
    if (source === EntrySource.Creator) {
      return user?.hideCreatorDates ?? false;
    } else if (source === EntrySource.Collector) {
      return user?.hideCollectorDates ?? true;
    }
    return false;
  };

  return (
    <div className={cn(PAGE_PADDING_X, "py-4")}>
      {content.length <= 1 ? (
        <TimelineBase
          entries={content[0]?.entries || []}
          EntryComponent={EntryComponent}
          hideDates={getHideDates(content[0]?.value || EntrySource.Creator)}
        />
      ) : (
        <Tabs
          defaultValue={content[0].value}
          value={tabValue}
          onValueChange={handleValueChange}
        >
          <TabsList className="w-fit flex-wrap bg-transparent mx-auto">
            {content.map((item) => (
              <TabsTrigger
                key={item.value}
                value={item.value}
                className="w-fit px-4 bg-transparent border-border data-[state=active]:border-primary 
                hover:border-primary/25 data-[state=active]:text-base data-[state=active]:shadow-none 
                rounded-none border-0  border-b-3  transition-[border-color] duration-400"
              >
                <P className="font-serif">{item.title}</P>
              </TabsTrigger>
            ))}
          </TabsList>

          {content.map((item) => (
            <TabsContent key={item.value} value={item.value} className="">
              <TimelineBase
                entries={item.entries}
                EntryComponent={EntryComponent}
                hideDates={getHideDates(item.value)}
              />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}