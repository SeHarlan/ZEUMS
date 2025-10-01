"use client";

import { TimelineEntry } from "@/types/entry";
import { FC, Fragment, useMemo } from "react";
import { H2, P } from "@/components/typography/Typography";
import { cn, getMainScrollAreaViewport } from "@/utils/ui-utils";
import { EntryBaseProps } from "./EntryBase";
import { Separator } from "../ui/separator";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { Button } from "../ui/button";
import { processTimelineEntries } from "@/utils/timeline";

interface TimelineBaseProps {
  entries: TimelineEntry[];
  EntryComponent: React.FC<EntryBaseProps>;
}

const TimelineBase: FC<TimelineBaseProps> = ({ entries, EntryComponent}) => {

  const renderedEntries = useMemo(() => {
    return processTimelineEntries(entries, (processedEntry) => {
      const {
        entry,
        entryDate,
        entryYear,
        showYear,
        showDate,
        flipEntry,
        flipDate,
      } = processedEntry;

      return (
        <Fragment key={entry._id.toString()}>
          {showYear && (
            <H2 className="w-fit sticky top-0 z-20 left-1/2 -translate-x-1/2 bg-background px-6 py-2 rounded-b-md text-muted-foreground shadow">
              {entryYear}
            </H2>
          )}
          {showDate && (
            <div className="flex justify-center">
              <div
                className={cn(
                  "flex items-center",
                  flipDate
                    ? "-translate-x-1/2 flex-row-reverse"
                    : "translate-x-1/2"
                )}
              >
                <div className="z-0 h-px w-4 border-2 border-dashed border-muted" />
                <P className={cn("text-lg text-muted-foreground px-2")}>
                  {entryDate}
                </P>
              </div>
            </div>
          )}

          <EntryComponent entry={entry} flip={flipEntry} />
        </Fragment>
      );
    });
  }, [entries, EntryComponent]);

  const handleScrollToBottom = () => {
    const viewport = getMainScrollAreaViewport();
    if (viewport) {
      viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
    }
  };

  const handleScrollToTop = () => {
    const viewport = getMainScrollAreaViewport();
    if (viewport) {
      viewport.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="pb-4 space-y-2">
      <Button
        className="mx-auto flex font-serif text-muted-foreground"
        variant="ghost"
        onClick={handleScrollToBottom}
      >
        Start at the beginning <ArrowDownIcon />
      </Button>
      <div className="relative pb-8 mb-0">
        <div className="z-0 h-full w-px absolute top-0 left-1/2 -translate-x-1/2 border-muted border-2 border-dashed" />
        <div className="relative flex flex-col space-y-6">
          {renderedEntries}
        </div>
      </div>
      <Separator />
      <Button
        className="mx-auto flex font-serif text-muted-foreground"
        variant="ghost"
        onClick={handleScrollToTop}
      >
        Back to the top <ArrowUpIcon />
      </Button>
    </div>
  );
};

export default TimelineBase;
