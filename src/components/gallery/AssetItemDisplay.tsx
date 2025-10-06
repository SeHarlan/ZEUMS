import { FC } from "react";
import { H4 } from "../typography/Typography";
import AssetViewer from "../assets/AssetViewer";
import EntryButtons from "../timeline/EntryButtons";
import { GalleryMediaItem} from "@/types/galleryItem";
import ExpandableText from "../general/ExpandableText";

interface AssetItemDisplayProps {
  item: GalleryMediaItem;
  hideTitle?: boolean;
  hideDescription?: boolean;
  hideButtons?: boolean;
}

const AssetItemDisplay: FC<AssetItemDisplayProps> = ({ item, hideTitle, hideDescription, hideButtons }) => {
  return (
    <div>
      <AssetViewer asset={item} />

      {(!hideTitle || !hideDescription) && (
        <div className="relative h-fit mt-3">
          {!hideTitle && <H4>{item.title}</H4>}
          {!hideDescription && (
            <ExpandableText
              className="md:mt-1"
              textClassName="text-muted-foreground text-sm whitespace-pre-line"
              text={item.description}
              clamp="line-clamp-2"
            />
          )}
        </div>
      )}
      {!hideButtons && <EntryButtons buttons={item.buttons} className="mt-2 justify-start" />}
    </div>
  );
};

export default AssetItemDisplay;
