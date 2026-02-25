import { GalleryMediaItem, isBlockchainAssetGalleryItem } from "@/types/galleryItem";
import { BlobUrlBuilderProps } from "@/types/media";
import { FC } from "react";
import AssetViewer from "../assets/AssetViewer";
import ExpandableText from "../general/ExpandableText";
import EntryButtons from "../timeline/EntryButtons";
import { H4 } from "../typography/Typography";

interface AssetItemDisplayProps {
  item: GalleryMediaItem;
  hideTitle?: boolean;
  hideDescription?: boolean;
  hideButtons?: boolean;
  sizeDivisor?: number;
  blobUrlBuilderProps?: BlobUrlBuilderProps;
}

const AssetItemDisplay: FC<AssetItemDisplayProps> = ({ item, hideTitle, hideDescription, hideButtons, sizeDivisor, blobUrlBuilderProps}) => {
  const isBlockchain = isBlockchainAssetGalleryItem(item);

  return (
    <div>
      <AssetViewer asset={item} sizeDivisor={sizeDivisor} blobUrlBuilderProps={blobUrlBuilderProps} />

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
      {!hideButtons && (
        <EntryButtons
          buttons={item.buttons}
          integrations={isBlockchain ? item.integrations : undefined}
          tokenAddress={isBlockchain ? item.tokenAddress : undefined}
          className="mt-2 justify-start"
        />
      )}
    </div>
  );
};

export default AssetItemDisplay;
