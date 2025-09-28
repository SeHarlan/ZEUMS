import { FC } from "react";
import { H3 } from "../typography/Typography";
import AssetViewer from "../assets/AssetViewer";
import EntryButtons from "../timeline/EntryButtons";
import { BlockchainAssetGalleryItem, UserAssetGalleryItem } from "@/types/galleryItem";
import ExpandableText from "../general/ExpandableText";

interface AssetItemDisplayProps {
  item: BlockchainAssetGalleryItem | UserAssetGalleryItem;
}

const AssetItemDisplay: FC<AssetItemDisplayProps> = ({ item }) => {
  return (
    <div className="space-y-4">
      <AssetViewer asset={item} />

      <div>
        <H3 className="lg:mb-2">{item.title}</H3>
        <ExpandableText
          className="mb-2 lg:mb-4"
          textClassName="text-muted-foreground whitespace-pre-line"
          text={item.description}
        />
      </div>
      <EntryButtons buttons={item.buttons} />
    </div>
  );
};

export default AssetItemDisplay;
