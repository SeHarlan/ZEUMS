import { GalleryType } from "@/types/gallery";
import { MiniGalleryItemBase } from "./GalleryItemBase";
import { FC,  useMemo } from "react";
import { cn } from "@/utils/ui-utils";
import {
  cleanGalleryRows,
  initializeGalleryRows,
  processGalleryRows,
} from "@/utils/gallery";
import useGalleryDimensions from "@/hooks/useGalleryDimensions";

interface GalleryBaseProps {
  gallery?: GalleryType | null;
}

const GAP = 12;
const MAX_HEIGHT_RATIO = 0.50;

const MiniGalleryBase: FC<GalleryBaseProps> = ({
  gallery,
}) => {
  const { containerRef, containerWidth, maxHeight, isDesktop, isReady } =
    useGalleryDimensions(false, MAX_HEIGHT_RATIO, true);

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
    <div className="space-y-3" ref={containerRef}>
      {isReady &&
        galleryRows.map((row, index) => (
          <div
            key={"row-" + index}
            className={cn("flex justify-center", "flex-row items-center")}
            style={{ gap: GAP }}
          >
            {row.map((cell) => (
              <div
                key={cell.item._id.toString()}
                className="relative duration-200 w-full h-fit"
                style={{ maxWidth: cell.width }}
              >
                <MiniGalleryItemBase item={cell.item} />
              </div>
            ))}
          </div>
        ))}
    </div>
  );
};

export default MiniGalleryBase;
