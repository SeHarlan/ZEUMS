import useGalleryDimensions from "@/hooks/useGalleryDimensions";
import { GalleryType } from "@/types/gallery";
import { GalleryItemTypes } from "@/types/galleryItem";
import { cleanGalleryRows, initializeGalleryRows, processGalleryRows } from "@/utils/gallery";
import { cn, getMainScrollAreaViewport } from "@/utils/ui-utils";
import { useVirtualizer } from "@tanstack/react-virtual";
import { FC, useCallback, useMemo } from "react";
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
const PADDING_DESKTOP = 100;
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

  // Calculate row heights: row height + padding + gap between rows
  const getRowHeight = useCallback((index: number): number => {
    if (!galleryRows[index]?.length) return 0;
    const row = galleryRows[index];
    const rowHeight = row[0]?.height || 0;

    const spacing = isDesktop ? PADDING_DESKTOP * 2 : GAP;
    return rowHeight + spacing * 2;
  }, [galleryRows, isDesktop]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    paddingEnd: PADDING,
    count: galleryRows.length,
    getScrollElement: getMainScrollAreaViewport,
    estimateSize: getRowHeight,
    overscan: 1,
    // Reduce layout thrashing and improve scroll performance with large media
    useAnimationFrameWithResizeObserver: true,
    // Enable debug mode in development if needed
    // debug: process.env.NODE_ENV === 'development',
  });

  return (
    <div ref={containerRef} className="w-full">
      {isReady && (
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = galleryRows[virtualRow.index];
            if (!row) return null;

            const gap = (!isDesktop || row.length <= 3) ? GAP : GAP_SMALL;
            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                className={cn(
                  "relative overflow-hidden",
                  "flex justify-center",
                  "flex-col md:flex-row items-center md:items-start"
                )}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`,
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
      )}
    </div>
  );
};

export default GalleryBase;