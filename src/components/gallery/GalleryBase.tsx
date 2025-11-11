import useGalleryDimensions from "@/hooks/useGalleryDimensions";
import { GalleryType } from "@/types/gallery";
import { GalleryItemTypes } from "@/types/galleryItem";
import { cleanGalleryRows, initializeGalleryRows, processGalleryRows } from "@/utils/gallery";
import { cn } from "@/utils/ui-utils";
import { FC, useMemo } from "react";
import { GalleryItemBaseProps } from "./GalleryItemBase";

interface GalleryBaseProps {
  gallery?: GalleryType | null;
  ItemComponent: React.FC<GalleryItemBaseProps>;
  hideItemTitles?: boolean;
  hideItemDescriptions?: boolean;
}

const GAP = 50; //px
const GAP_SMALL = 25; //px
const MAX_HEIGHT_RATIO = 0.75;
const PADDING_DESKTOP = 50;
const PADDING_MOBILE = 25;


const GalleryBase: FC<GalleryBaseProps> = ({
  gallery,
  ItemComponent,
  hideItemTitles,
  hideItemDescriptions,
}) => {
  const { containerRef, containerWidth, maxHeight, isDesktop, isReady } =
    useGalleryDimensions(true, MAX_HEIGHT_RATIO);
  
  const PADDING = isDesktop ? PADDING_DESKTOP : PADDING_MOBILE;

  const galleryItems = gallery?.items;

  const galleryRows = useMemo(() => {
    if (!galleryItems?.length) return [];
    const galleryRows = initializeGalleryRows(galleryItems);
    const processedRows = processGalleryRows({
      galleryRows,
      gap: GAP,
      gapSmall: GAP_SMALL,
      padding: PADDING,
      useRowHeight: isDesktop,
      containerWidth,
      maxHeight,
    });
    return cleanGalleryRows(processedRows);
  }, [galleryItems, PADDING, isDesktop, containerWidth, maxHeight]);

  return (
    <div className={cn("space-y-30 pb-30")} ref={containerRef}>
      {isReady &&
        galleryRows.map((row, index) => {
          const gap = row.length > 3 ? GAP_SMALL : GAP;
          return (
            <div
              key={"row-" + index}
              className={cn(
                "relative overflow-hidden rounded-xl",
                "flex justify-center",
                "flex-col md:flex-row items-center md:items-start",
              )}
              style={{
                gap,
                padding: PADDING,
              }}
            >
              {row.map((cell) => {
                const isNotTextOnlyRow = row.some(
                  (cell) => cell.item.itemType !== GalleryItemTypes.Text
                );
                const useFixedHeight =
                  cell.item.itemType === GalleryItemTypes.Text &&
                  isNotTextOnlyRow;

                return (
                  <div
                    key={cell.item._id.toString()}
                    className={cn("relative duration-200 w-full")}
                    style={{
                      maxWidth: cell.width,
                    }}
                  >
                    <div
                      className={cn(
                        useFixedHeight &&
                          "flex flex-col w-full shrink-0 justify-center"
                      )}
                      style={useFixedHeight ? { height: cell.height } : {}}
                    >
                      <ItemComponent
                        item={cell.item}
                        hideTitle={hideItemTitles}
                        hideDescription={hideItemDescriptions}
                        sizeDivisor={row.length}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
    </div>
  );
};

export default GalleryBase;