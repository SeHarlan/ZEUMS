import { FC, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, GripVertical, Image as ImageIcon, Video, Box, Code2 } from "lucide-react";
import { TimelineEntry, isBlockchainAssetEntry, isUserAssetEntry } from "@/types/entry";
import { cn } from "@/utils/ui-utils";
import MediaThumbnail from "@/components/media/MediaThumbnail";
import { MediaCategory } from "@/types/media";

interface GalleryGridItemProps {
  entry: TimelineEntry;
  onRemove: (id: string) => void;
  isDragging?: boolean;
}

const GalleryGridItem: FC<GalleryGridItemProps> = ({ entry, onRemove, isDragging = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: entry._id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getMediaIcon = () => {
    if (isBlockchainAssetEntry(entry) || isUserAssetEntry(entry)) {
      switch (entry.media.category) {
        case MediaCategory.Video:
          return <Video className="size-4" />;
        case MediaCategory.Vr:
          return <Box className="size-4" />;
        case MediaCategory.Html:
          return <Code2 className="size-4" />;
        default:
          return <ImageIcon className="size-4" />;
      }
    }
    return <ImageIcon className="size-4" />;
  };

  const getEntryTypeBadge = () => {
    if (isBlockchainAssetEntry(entry)) {
      return <Badge variant="secondary" className="text-xs">NFT</Badge>;
    } else if (isUserAssetEntry(entry)) {
      return <Badge variant="outline" className="text-xs">Upload</Badge>;
    }
    return null;
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative cursor-grab active:cursor-grabbing",
        (isDragging || isSortableDragging) && "opacity-50 z-50"
      )}
    >
      <CardContent className="p-3 space-y-2">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Button size="sm" variant="secondary" className="h-6 w-6 p-0 rounded-full">
            <GripVertical className="size-3" />
          </Button>
        </div>

        {/* Remove Button */}
        <Button
          size="sm"
          variant="destructive"
          className="absolute top-2 right-2 z-10 h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(entry._id.toString());
          }}
        >
          <X className="size-3" />
        </Button>

        {/* Media Thumbnail */}
        <div className="relative aspect-square rounded-md overflow-hidden bg-muted">
          {(isBlockchainAssetEntry(entry) || isUserAssetEntry(entry)) && (
            <MediaThumbnail
              media={entry.media}
              alt={entry.title || "Asset"}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Asset Info */}
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-sm line-clamp-2 leading-tight">
              {entry.title || "Untitled"}
            </h4>
            <div className="flex items-center gap-1 flex-shrink-0">
              {getMediaIcon()}
              {getEntryTypeBadge()}
            </div>
          </div>
          
          {entry.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {entry.description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

interface GalleryGridProps {
  items: TimelineEntry[];
  onReorder: (items: TimelineEntry[]) => void;
  onRemove: (id: string) => void;
  className?: string;
}

const GalleryGrid: FC<GalleryGridProps> = ({ items, onReorder, onRemove, className }) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (active.id !== over?.id) {
      const oldIndex = items.findIndex(item => item._id.toString() === active.id);
      const newIndex = items.findIndex(item => item._id.toString() === over?.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newItems = arrayMove(items, oldIndex, newIndex);
        onReorder(newItems);
      }
    }
  };

  const activeItem = activeId ? items.find(item => item._id.toString() === activeId) : null;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Gallery Items</h3>
        <span className="text-sm text-muted-foreground">
          {items.length} item{items.length !== 1 ? 's' : ''}
        </span>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items.map(item => item._id.toString())} strategy={rectSortingStrategy}>
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-muted rounded-lg">
              <ImageIcon className="size-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No items in gallery
              </h3>
              <p className="text-sm text-muted-foreground">
                Drag and drop assets from the side panel to build your gallery
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((item) => (
                <GalleryGridItem
                  key={item._id.toString()}
                  entry={item}
                  onRemove={onRemove}
                  isDragging={activeId === item._id.toString()}
                />
              ))}
            </div>
          )}
        </SortableContext>

        <DragOverlay>
          {activeItem ? (
            <GalleryGridItem
              entry={activeItem}
              onRemove={() => {}}
              isDragging={true}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default GalleryGrid;