import { TextEntry } from "@/types/entry";
import { FC } from "react";
import { H3, P } from "../typography/Typography";
import EntryButtons from "./EntryButtons";

interface TextEntryDisplayProps {
  entry: TextEntry;
}

const TextEntryDisplay: FC<TextEntryDisplayProps> = ({ entry }) => {
  return (
    <div className="text-center bg-background p-2">
      <H3>{entry.title}</H3>
      <P className="text-muted-foreground">{entry.description}</P>
      <EntryButtons buttons={entry.buttons} />
    </div>
  );
};

export default TextEntryDisplay;
