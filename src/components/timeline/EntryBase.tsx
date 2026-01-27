import { EntryTypes, TimelineEntry } from "@/types/entry";
import { getBlobUrlBuilderPropsFromItemOrEntry } from "@/utils/media";
import { FC, useMemo } from "react";
import AssetEntryDisplay from "./AssetEntryDisplay";
import GalleryEntryDisplay from "./GalleryEntryDisplay";
import TextEntryDisplay from "./TextEntryDisplay";

export interface EntryBaseProps { 
  entry: TimelineEntry;
  flip?: boolean; // Optional prop to flip the order of the entry display components
}

const EntryBase: FC<EntryBaseProps> = ({ entry, flip }) => {
  // Create blobUrlBuilderProps for UserAssetEntry
  const blobUrlBuilderProps = useMemo(() => {
    return getBlobUrlBuilderPropsFromItemOrEntry(entry);
  }, [entry]);

  if(entry.entryType === EntryTypes.Text) {
    return <TextEntryDisplay entry={entry} />;
  }

  if (entry.entryType === EntryTypes.BlockchainAsset || entry.entryType === EntryTypes.UserAsset) {
    return <AssetEntryDisplay entry={entry} flip={flip} blobUrlBuilderProps={blobUrlBuilderProps} />;
  }

  if (entry.entryType === EntryTypes.Gallery) {
    return <GalleryEntryDisplay entry={entry} flip={flip} />;
  }
};

export default EntryBase;