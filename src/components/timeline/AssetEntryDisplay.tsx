import { BlockchainAssetEntry, UserAssetEntry } from "@/types/entry";
import { FC } from "react";
import { H3, P } from "../typography/Typography";
import AssetViewer from "../assets/AssetViewer";
import EntryButtons from "./EntryButtons";
import { cn } from "@/utils/ui-utils";

interface AssetEntryDisplayProps {
  entry: BlockchainAssetEntry | UserAssetEntry;
  flip?: boolean; // Optional prop to flip the order of the entry display
}

const AssetEntryDisplay: FC<AssetEntryDisplayProps> = ({ entry, flip }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-12 items-center pb-4">
      <div className={cn("order-1", flip && "lg:order-2")}>
        <AssetViewer asset={entry} />
      </div>

      <div
        className={cn("flex flex-col space-y-2 order-2 bg-background py-4 px-2", flip && "lg:order-1")}
      >
        <H3>{entry.title}</H3>
        <P className="text-muted-foreground line-clamp-12 whitespace-pre-line">
          {entry.description}
        </P>
        <EntryButtons buttons={entry.buttons} />
      </div>
    </div>
  );
};

export default AssetEntryDisplay;
