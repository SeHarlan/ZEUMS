import { GalleryType } from "@/types/gallery";
import { GalleryItemBaseProps } from "./GalleryItemBase";
import { FC, useMemo } from "react";
import { cn } from "@/utils/ui-utils";
import { cleanGalleryRows, initializeGalleryRows, processGalleryRows } from "@/utils/gallery";
import useGalleryDimensions from "@/hooks/useGalleryDimensions";

interface GalleryBaseProps {
  gallery?: GalleryType | null;
  ItemComponent: React.FC<GalleryItemBaseProps>;
  hideItemTitles?: boolean;
  hideItemDescriptions?: boolean;
}

const GAP = 32; //px
const MAX_HEIGHT_RATIO = 0.75;


const GalleryBase: FC<GalleryBaseProps> = ({
  gallery,
  ItemComponent,
  hideItemTitles,
  hideItemDescriptions,
}) => {

  const {
    containerRef,
    containerWidth,
    maxHeight,
    isDesktop,
    isReady,
  } = useGalleryDimensions(true, MAX_HEIGHT_RATIO);

  const galleryRows = useMemo(() => {
    if (!gallery?.items?.length) return [];
    const galleryRows = initializeGalleryRows(gallery.items);
    const processedRows = processGalleryRows({
      galleryRows,
      gap: GAP,
      useRowHeight: isDesktop,
      containerWidth,
      maxHeight,
    });
    return cleanGalleryRows(processedRows);
  }, [gallery?.items, containerWidth, maxHeight, isDesktop]);

  return (
    <div className="space-y-30 mb-30" ref={containerRef}>
      {isReady &&
        galleryRows.map((row, index) => (
          <div
            key={"row-" + index}
            className={cn(
              "flex justify-center",
              "flex-col md:flex-row items-center"  
            )}
            style={{ gap: GAP }}
          >
            {row.map((cell) => (
              <div
                key={cell.item._id.toString()}
                className="relative duration-200 w-full h-fit"
                style={{ maxWidth: cell.width }}
              >
                <ItemComponent
                  item={cell.item}
                  hideTitle={hideItemTitles}
                  hideDescription={hideItemDescriptions}
                />
              </div>
            ))}
          </div>
        ))}
    </div>
  );
};

export default GalleryBase;