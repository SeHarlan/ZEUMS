import { GalleryType } from "@/types/gallery";
import { GalleryItemBaseProps } from "./GalleryItemBase";
import { FC, useMemo } from "react";
import { cn } from "@/utils/ui-utils";
import { cleanGalleryRows, initializeGalleryRows, processGalleryRows } from "@/utils/gallery";
import useGalleryDimensions from "@/hooks/useGalleryDimensions";
import { GalleryItemTypes } from "@/types/galleryItem";

interface GalleryBaseProps {
  gallery?: GalleryType | null;
  ItemComponent: React.FC<GalleryItemBaseProps>;
  hideItemTitles?: boolean;
  hideItemDescriptions?: boolean;
}

const GAP = 50; //px
const MAX_HEIGHT_RATIO = 0.75;
const PADDING = 25;


const GalleryBase: FC<GalleryBaseProps> = ({
  gallery,
  ItemComponent,
  hideItemTitles,
  hideItemDescriptions,
}) => {
  const { containerRef, containerWidth, maxHeight, isDesktop, isReady } =
    useGalleryDimensions(true, MAX_HEIGHT_RATIO);

  const galleryRows = useMemo(() => {
    if (!gallery?.items?.length) return [];
    const galleryRows = initializeGalleryRows(gallery.items);
    const processedRows = processGalleryRows({
      galleryRows,
      gap: GAP,
      padding: PADDING,
      useRowHeight: isDesktop,
      containerWidth,
      maxHeight,
    });
    return cleanGalleryRows(processedRows);
  }, [gallery?.items, containerWidth, maxHeight, isDesktop]);

  return (
    <div className="space-y-30 mb-30" ref={containerRef}>
      {isReady &&
        galleryRows.map((row, index) => {

          const isEven = index % 2 !== 0;

          return (
            <div
              key={"row-" + index}
              className={cn(
                "relative overflow-hidden",
                "flex justify-center",
                "flex-col md:flex-row items-center md:items-start",
                isEven && "bg-secondary rounded-lg border shadow"
              )}
              style={{
                gap: GAP,
                padding: PADDING,
                paddingBottom: isEven ? PADDING : 0,
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
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          );
        }
      )}
    </div>
  );
};

export default GalleryBase;