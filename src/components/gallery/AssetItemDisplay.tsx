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
    <div>
      <AssetViewer asset={item} className="mb-4" />

      <div className="relative">
        <H3 className="">{item.title}</H3>
        <ExpandableText
          className="lg:mt-2"
          textClassName="text-muted-foreground whitespace-pre-line"
          text={item.description}
          clamp="line-clamp-2"
        />
      </div>
      <EntryButtons buttons={item.buttons} />
    </div>
  );
};

export default AssetItemDisplay;
