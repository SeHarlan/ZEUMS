import { EntryButton } from "@/types/entry";
import { FC } from "react";
import { LinkButton } from "../ui/button";

interface EntryButtonsProps {
  buttons?: EntryButton[];
}

const EntryButtons: FC<EntryButtonsProps> = ({ buttons }) => {
  if (!buttons || buttons.length === 0) return null;

  return (
    <div className="flex space-x-2 w-full justify-end-safe">
      {buttons.map((button, index) => (
        <LinkButton key={index + button.text} href={button.url}>
          {button.text}
        </LinkButton>
      ))}
    </div>
  );
};

export default EntryButtons;
