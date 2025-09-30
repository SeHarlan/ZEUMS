import { GalleryType } from "@/types/gallery";
import { GalleryItemBaseProps } from "./GalleryItemBase";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import { GalleryItem, isGalleryMediaItem } from "@/types/galleryItem";
import { debounce } from "@/utils/general";

interface GalleryBaseProps {
  gallery: GalleryType;
  ItemComponent: React.FC<GalleryItemBaseProps>;
}

interface GalleryRowItem {
  item: GalleryItem;
  width: number;
  height: number;
}

const GAP = 32 as const; //px
const MAX_HEIGHT_RATIO = 0.75;
const NON_MEDIA_ASPECT_RATIO = 1.5;

const GalleryBase: FC<GalleryBaseProps> = ({ gallery, ItemComponent }) => { 
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [maxHeight, setMaxHeight] = useState<number>(0);



  useEffect(() => {
    const getDimensions = () => {
      if (!containerRef?.current) return;

      const rowWidth = containerRef.current.offsetWidth;
      setContainerWidth(rowWidth);

      setMaxHeight(window.innerHeight * MAX_HEIGHT_RATIO);
    };


    getDimensions();

    const debouncedGetDimensions = debounce(getDimensions, 250);

    window.addEventListener("resize", debouncedGetDimensions);
    return () => {
      debouncedGetDimensions.cancel();
      window.removeEventListener("resize", debouncedGetDimensions);
    };
  }, []);

  const galleryRows = useMemo(() => {
    if (!gallery.items || gallery.items.length === 0) return [];

    //organize into rows based on position
    const rows: GalleryItem[][] = [];

    for (const item of gallery.items) {
      const [y, x] = item.position;
      if (rows[y]) {
        rows[y][x] = item;
      } else {
        rows[y] = [item];
      }
    }

    //calculate the width of each item
    // height of the images should be the same
    // use the height and aspect ratio for calculation (+ the gap)
    const galleryRowsWithWidth: GalleryRowItem[][] = rows.map((row) => {
      const totalAspectRatio = row.reduce((acc, item) => {
        const aspectRatio =
          isGalleryMediaItem(item)
            ? item.media?.aspectRatio || 1
            : NON_MEDIA_ASPECT_RATIO;
        return acc + aspectRatio;
      }, 0);

      const rowGapOffset = GAP * (row.length - 1);
      const rowHeight = Math.min(
        (containerWidth - rowGapOffset) / totalAspectRatio,
        maxHeight
      );

      return row.map((item) => {
        const aspectRatio = isGalleryMediaItem(item)
          ? item.media?.aspectRatio || 1
          : NON_MEDIA_ASPECT_RATIO;
        
        const width = aspectRatio * rowHeight;

        return {
          item,
          width,
          height: rowHeight,
        };
      });
    });
    return galleryRowsWithWidth;
  }, [gallery.items, containerWidth, maxHeight]);

  return (
    <div className="space-y-12" ref={containerRef}>
      {galleryRows.map((row, index) => (
        <div
          key={"row-" + index}
          className={`flex items-start justify-center`}
          style={{
            gap: GAP,
          }}
        >
          {row.map((cell) => (
            <div
              key={cell.item._id.toString()}
              className="relative"
              style={{
                width: cell.width,
              }}
            >
              <ItemComponent item={cell.item} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default GalleryBase;