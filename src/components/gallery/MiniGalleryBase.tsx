import { ImageSizing } from "@/constants/ui";
import useGalleryDimensions from "@/hooks/useGalleryDimensions";
import { GalleryType } from "@/types/gallery";
import {
  cleanGalleryRows,
  initializeGalleryRows,
  processGalleryRows,
} from "@/utils/gallery";
import { cn } from "@/utils/ui-utils";
import { FC, useMemo } from "react";
import { MiniGalleryItemBase } from "./GalleryItemBase";

interface GalleryBaseProps {
  gallery?: GalleryType | null;
  imageSize?: ImageSizing;
}

const GAP = 12;
const MAX_HEIGHT_RATIO = .75;

const MiniGalleryBase: FC<GalleryBaseProps> = ({
  gallery,
  imageSize,
}) => {
  const { containerRef, containerWidth, maxHeight, isDesktop, isReady } =
    useGalleryDimensions(false, MAX_HEIGHT_RATIO, true);

  const galleryItems = gallery?.items;
  
  const galleryRows = useMemo(() => {
    if (!galleryItems?.length) return [];
    const galleryRows = initializeGalleryRows(galleryItems);
    const processedRows = processGalleryRows({
      galleryRows,
      gap: GAP,
      useRowHeight: isDesktop,
      containerWidth,
      maxHeight,
    });
    return cleanGalleryRows(processedRows);
  }, [galleryItems, containerWidth, maxHeight, isDesktop]);

  return (
    <div className="space-y-3" ref={containerRef}>
      {isReady &&
        galleryRows.map((row, index) => {
          return (
            <div
              key={"row-" + index}
              className={cn(
                "flex justify-center",
                "flex-row items-center",
              )}
              style={{ gap: GAP }}
            >
              {row.map((cell) => (
                <div
                  key={cell.item._id.toString()}
                  className={cn("relative duration-200 w-full h-fit")}
                  style={{ maxWidth: cell.width }}
                >
                  <MiniGalleryItemBase item={cell.item} imageSize={imageSize} />
                </div>
              ))}
            </div>
          )
        })
      }
    </div>
  );
};

export default MiniGalleryBase;
