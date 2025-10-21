import { editTimelineSourceAtom } from "@/atoms/dashboard";
import { P } from "@/components/typography/Typography";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUser } from "@/context/UserProvider";
import { isEntrySource } from "@/types/entry";
import { getTimelineTabContent } from "@/utils/timeline";
import { cn } from "@/utils/ui-utils";
import { useAtom } from "jotai/react";
import { Minimize2Icon } from "lucide-react";
import { useState } from "react";
import { EditBar } from "../EditBar";
import EditDisplayFormButton from "./editDisplayForm/EditDisplayForm";
import NewEntryFormButton from "./newEntryForm/NewEntryForm";
import RearrangeEntriesButton from "./RearrangeEntries";

export const EditTimelineBar = ({ fixed = true }: { fixed?: boolean }) => {
  const { user } = useUser();
  const [tabValue, setTabValue] = useAtom(editTimelineSourceAtom);
  const [isOpen, setIsOpen] = useState(true);

  const source = tabValue;
  const content = getTimelineTabContent(user, true);
  const handleValueChange = (value: string) => {
    if (isEntrySource(value)) {
      setTabValue(value);
    }
  };
  return (
    <EditBar fixed={fixed} isOpen={isOpen} setIsOpen={setIsOpen}>
      <div className="grid grid-cols-[1fr_auto] md:grid-cols-6 w-full gap-2">
        <div className="size-px hidden md:block" />
        <Tabs
          defaultValue={content[0].value}
          value={tabValue}
          onValueChange={handleValueChange}
          className="md:col-span-4 mx-auto w-full"
        >
          <TabsList className="w-full grid grid-cols-2 shadow-md h-fit p-0 border-none">
            {content.map((item, index) => (
              <TabsTrigger
                value={item.value}
                primaryActive={index === 1 || fixed}
              >
                <Tooltip key={item.value}>
                  <TooltipTrigger asChild>
                    <P className="font-serif w-full h-full">{item.title}</P>
                  </TooltipTrigger>
                  <TooltipContent>
                    Edit your {item.value} timeline
                  </TooltipContent>
                </Tooltip>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="justify-self-end p-0 h-auto"
        >
          <Minimize2Icon />
        </Button>
      </div>
      <div
        className={cn(
          "grid gap-2 w-full",
          fixed ? "grid-cols-3" : "grid-cols-2"
        )}
      >
        {fixed && <EditDisplayFormButton buttonVariant="outline" />}
        <NewEntryFormButton source={source} buttonVariant="default" />
        <RearrangeEntriesButton
          source={source}
          buttonVariant="outline"
          buttonText="Rearange"
        />
      </div>
    </EditBar>
  );
};
