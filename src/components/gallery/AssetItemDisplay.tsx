import { FC } from "react";
import { H4 } from "../typography/Typography";
import AssetViewer from "../assets/AssetViewer";
import EntryButtons from "../timeline/EntryButtons";
import { BlockchainAssetGalleryItem, UserAssetGalleryItem } from "@/types/galleryItem";
import ExpandableText from "../general/ExpandableText";

interface AssetItemDisplayProps {
  item: BlockchainAssetGalleryItem | UserAssetGalleryItem;
  hideTitle?: boolean;
  hideDescription?: boolean;
}

const AssetItemDisplay: FC<AssetItemDisplayProps> = ({ item, hideTitle, hideDescription }) => {
  return (
    <div>
      <AssetViewer asset={item} className="mb-3" />

      {(!hideTitle || !hideDescription) && (
        <div className="relative mb-2 h-fit">
          {!hideTitle && <H4>{item.title}</H4>}
          {!hideDescription && (
            <ExpandableText
              className="md:mt-2"
              textClassName="text-muted-foreground text-sm whitespace-pre-line"
              text={item.description}
              clamp="line-clamp-2"
            />
          )}
        </div>
      )}
      <EntryButtons buttons={item.buttons} />
    </div>
  );
};

export default AssetItemDisplay;
