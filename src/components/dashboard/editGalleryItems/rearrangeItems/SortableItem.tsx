import { MiniGalleryItemBase } from "@/components/gallery/GalleryItemBase";
import { GripVerticalIcon } from "lucide-react";
import { GalleryRowItem } from "@/types/ui/dashboard";
import { FC } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { cn } from "@/utils/ui-utils";

interface SortableItemProps {
  processedItem: GalleryRowItem;
  hoverSide: "left" | "right" | null;
}
const SortableItem: FC<SortableItemProps> = ({ processedItem, hoverSide }) => {
  const { item, width } = processedItem;
  
  const {
    attributes,
      listeners,
      setNodeRef,
      transition,
      isDragging,
      isOver,
    } = useSortable({
      id: item._id.toString(),
    });
 
  //dont use transform cause we have a custom position indicator that works better for the multi row layout
  const style = {
    transition,
    opacity: isDragging ? 0.25 : 1,
    maxWidth: width,
  };

  return (
    <div
      className={cn(
        "z-10 relative w-full h-fit cursor-grab active:cursor-grabbing duration-200 bg-muted rounded-md"
      )}
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    >
      <GripVerticalIcon className="absolute z-20 -left-2 top-1/2 -translate-y-1/2 bg-muted rounded w-4 h-8 shrink-0" />
      <div
        className={cn(
          "flex-shrink-0 rounded-md",
          isOver ? "shadow-lg" : "shadow"
        )}
      >
        <MiniGalleryItemBase item={item} />
      </div>

      {hoverSide && (
        <div
          className={cn(
            "h-full absolute z-30 w-1 bg-muted-foreground rounded-md top-1/2 -translate-y-1/2",
            hoverSide === "left" && "-left-1",
            hoverSide === "right" && "-right-1"
          )}
        />
      )}
    </div>
  );
};

export default SortableItem;

interface OverlayItemProps {
  processedItems: GalleryRowItem[][];
  activeId: string;
  containerWidth: number;
}
export const OverlayItem: FC<OverlayItemProps> = ({ processedItems, activeId }) => {
  const processedItem = processedItems.flat().find((rowItem) => rowItem.item._id.toString() === activeId);
  if (!processedItem) return null;
  const { item, width } = processedItem;

  return (
    <div
      className="z-20 relative w-full h-fit cursor-grabbing bg-muted rounded-md"
      style={{ maxWidth: width }}
    >
      <GripVerticalIcon className="absolute z-20 -left-2 top-1/2 -translate-y-1/2 bg-muted rounded w-4 h-8 shrink-0" />
      <div className="flex-shrink-0 rounded-md shadow-lg">
        <MiniGalleryItemBase item={item} priority />
      </div>
    </div>
  );
};