import { EntryTypes, TimelineEntry } from "@/types/entry";
import { FC } from "react";
import TextEntryDisplay from "./TextEntryDisplay";
import AssetEntryDisplay from "./AssetEntryDisplay";
import GalleryEntryDisplay from "./GalleryEntryDisplay";

export interface EntryBaseProps { 
  entry: TimelineEntry;
  flip?: boolean; // Optional prop to flip the order of the entry display components
}

const EntryBase: FC<EntryBaseProps> = ({ entry, flip }) => {
  if(entry.entryType === EntryTypes.Text) {
    return <TextEntryDisplay entry={entry} />;
  }

  if (entry.entryType === EntryTypes.BlockchainAsset || entry.entryType === EntryTypes.UserAsset) {
    return <AssetEntryDisplay entry={entry} flip={flip} />;
  }

  if (entry.entryType === EntryTypes.Gallery) {
    return <GalleryEntryDisplay entry={entry} flip={flip} />;
  }
};

export default EntryBase;