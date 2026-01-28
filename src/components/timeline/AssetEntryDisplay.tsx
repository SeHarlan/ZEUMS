import { BlockchainAssetEntry, UserAssetEntry } from "@/types/entry";
import { BlobUrlBuilderProps } from "@/types/media";
import { cn } from "@/utils/ui-utils";
import { FC } from "react";
import AssetViewer from "../assets/AssetViewer";
import ExpandableText from "../general/ExpandableText";
import { H3 } from "../typography/Typography";
import EntryButtons from "./EntryButtons";

interface AssetEntryDisplayProps {
  entry: BlockchainAssetEntry | UserAssetEntry;
  flip?: boolean; // Optional prop to flip the order of the entry display
  sizeDivisor?: number;
  blobUrlBuilderProps?: BlobUrlBuilderProps;
}

// Size divisor here assumes timeline is in classic timeline view where an image is always half the screen
const AssetEntryDisplay: FC<AssetEntryDisplayProps> = ({ entry, flip, sizeDivisor = 2, blobUrlBuilderProps }) => {  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-12 items-center pb-4">
      <div className={cn("order-1", flip && "md:order-2")}>
        <AssetViewer asset={entry} sizeDivisor={sizeDivisor} blobUrlBuilderProps={blobUrlBuilderProps} />
      </div>

      <div
        className={cn("order-2 py-4 px-2", flip && "md:order-1")}
      >
        <div className="relative mb-2 text-center">
          <H3 className="">{entry.title}</H3>
          <ExpandableText
            className="md:mt-2"
            textClassName="text-muted-foreground whitespace-pre-line"
            text={entry.description}
            clamp="line-clamp-6"
          />
        </div>
        <EntryButtons buttons={entry.buttons} />
      </div>
    </div>
  );
};

export default AssetEntryDisplay;
