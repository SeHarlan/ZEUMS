"use client";
import { P } from "@/components/typography/Typography";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUser } from "@/context/UserProvider";
import { EntrySource } from "@/types/entry";
import { EditTimelineTab } from "@/types/ui/dashboard";
import { FC } from "react";

interface SourceTabsProps {
  EditComponent: React.FC<{source: EntrySource}>;
}
const SourceTabs: FC<SourceTabsProps> = ({EditComponent}) => { 
  const { user } = useUser();
  const contentMap = [
    {
      title: "Created",
      value: EditTimelineTab.ARTIST,
      source: EntrySource.Creator,
    },
    {
      title: "Collected",
      value: EditTimelineTab.COLLECTOR,
      source: EntrySource.Collector,
    },
    {
      title: "Curator",
      value: EditTimelineTab.CURATOR,
      source: undefined, // TODO: add curator source
    },
  ];

  const orderedContent = () => {
    switch (user?.primaryTimeline) {
      case EditTimelineTab.CURATOR:
        return [contentMap[2], contentMap[1], contentMap[0]];
      case EditTimelineTab.COLLECTOR:
        return [contentMap[1], contentMap[2], contentMap[0]];
      default:
        return [contentMap[0], contentMap[1], contentMap[2]];
    }
  };

  const content = orderedContent().filter(
    (item): item is NonNullable<typeof item> => Boolean(item)
  );

  return (
    <Tabs defaultValue={content[0].value}>
      <TabsList className="w-full justify-stretch">
        {content.map((item) => (
          <TabsTrigger key={item.value} value={item.value}>
            {item.title}
          </TabsTrigger>
        ))}
      </TabsList>

      {content.map((item) => (
        <TabsContent
          key={item.value}
          value={item.value}
          className="flex flex-col space-y-8 mt-4"
        >
          {item.source ? (
            <EditComponent source={item.source} />
          ) : (
            <P className="font-serif text-2xl text-center my-10">~ Coming Soon ~</P>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}

export default SourceTabs;