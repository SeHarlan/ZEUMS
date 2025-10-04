import { FC } from "react";
import { H3, P } from "../typography/Typography";
import { TextGalleryItem } from "@/types/galleryItem";
import EntryButtons from "../timeline/EntryButtons";

interface TextItemDisplayProps {
  item: TextGalleryItem;
}

const TextItemDisplay: FC<TextItemDisplayProps> = ({ item }) => {
  return (
    <div className="text-center p-2 w-full">
      <H3 className="mb-2">{item.title}</H3>
      <P className="text-muted-foreground mb-4">{item.description}</P>
      <EntryButtons buttons={item.buttons} />
    </div>
  );
};

export default TextItemDisplay;
