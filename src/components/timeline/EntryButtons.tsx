import { EntryButton } from "@/types/entry";
import { FC } from "react";
import { LinkButton } from "../ui/button";
import { cn } from "@/utils/ui-utils";

interface EntryButtonsProps {
  buttons?: EntryButton[];
}

const EntryButtons: FC<EntryButtonsProps> = ({ buttons }) => {
  if (!buttons || buttons.length === 0) return null;

  return (
    //Reverse so the primary button is last
    //Dont use row-reverse cause we want the primary button to drop down on wrap
    <div className={cn("flex justify-end gap-2 flex-wrap w-full")}>
      {buttons.toReversed().map((button, index) => (
        <LinkButton
          key={index + button.text}
          href={button.url}
          variant={index === buttons.length - 1 ? "default" : "outline"}
        >
          {button.text}
        </LinkButton>
      ))}
    </div>
  );
};

export default EntryButtons;
