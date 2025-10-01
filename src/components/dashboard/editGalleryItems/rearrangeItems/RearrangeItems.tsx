import SideDrawer from "@/components/general/SideDrawer"
import { P } from "@/components/typography/Typography"
import { Button } from "@/components/ui/button"
import useGalleryDimensions from "@/hooks/useGalleryDimensions"
import { GalleryType } from "@/types/gallery"
import { GalleryRowItem } from "@/types/ui/dashboard"
import { cleanGalleryRows, initializeGalleryRows, processGalleryRows, swapToExistingRow, swapToNewRowAfter, swapToNewRowBefore } from "@/utils/gallery"
import { cn  } from "@/utils/ui-utils"
import { closestCenter, DndContext, DragEndEvent, DragMoveEvent, DragOverlay, DragStartEvent, useDroppable } from "@dnd-kit/core"
import { SortableContext} from "@dnd-kit/sortable"
import {  LayoutTemplateIcon, PlusSquare } from "lucide-react"
import { FC, useEffect, useMemo,  useState } from "react"
import { KeyedMutator } from "swr"
import LoadingSpinner from "@/components/general/LoadingSpinner"
import SortableItem, { OverlayItem } from "./SortableItem"


const GAP = 12;
const DROP_AREA_ID_AFTER = "droppable-area-after";
const DROP_AREA_ID_BEFORE = "droppable-area-before";
const MAX_HEIGHT_RATIO = 0.33;

interface RearrangeItemsProps {
  gallery: GalleryType;
  mutateGallery: KeyedMutator<GalleryType | null>;
}

interface HoverData {
  id: string;
  side: "left" | "right";
}
const RearrangeItems: FC<RearrangeItemsProps> = ({ gallery, mutateGallery }) => { 
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoverData, setHoverData] = useState<HoverData | null>(null);
  const [rearrangedRows, setRearrangedRows] = useState<GalleryRowItem[][]>([]);

  const { containerRef, containerWidth, maxHeight, isReady, getDimensions } = useGalleryDimensions(false, MAX_HEIGHT_RATIO);

  useEffect(() => {
    //because of form dom handling we need to manually set dimensions again for the initial render
    if (formOpen && !isReady) {
      // wait for the container to be ready
      // requestAnimationFrame() to ensure dom has loaded
      requestAnimationFrame(getDimensions);
    }
  }, [getDimensions, isReady, formOpen]);

  useEffect(() => {
    //initial load of gallery items when the form is open
    if (!gallery.items || !formOpen) return;
    const initRows = initializeGalleryRows(gallery.items);
    //remove stray empty rows/cells and update positions
    const cleanedRows = cleanGalleryRows(initRows);
    setRearrangedRows(cleanedRows);

    //reset rearrangedRows when the form is closed
    return () => setRearrangedRows([]);
  }, [gallery.items, formOpen]);

  const galleryRows = useMemo(() => {
    return processGalleryRows({
      galleryRows: rearrangedRows,
      gap: GAP,
      useRowHeight: true,
      containerWidth,
      maxHeight,
    });
  }, [rearrangedRows, containerWidth, maxHeight]);

  const onDragStart = (event: DragStartEvent) => { 
    const { active } = event;
    setActiveId(active.id.toString());
  }

  const getCursorSide = (event: DragMoveEvent): HoverData | null => { 
    const { activatorEvent, over, delta } = event;
    if (!over ||!(activatorEvent instanceof MouseEvent)) return null;

    const overRect = over.rect;
    const mouseX = activatorEvent.clientX + delta.x;

    // Calculate which side of the over item the cursor is on
    const overCenterX = overRect.left + overRect.width / 2;
    const cursorSide = mouseX < overCenterX ? "left" : "right";
    return { id: over.id.toString(), side: cursorSide }
  }

  const onDragMove = (event: DragMoveEvent) => {
    const cursorSideData = getCursorSide(event);
    if(!cursorSideData) return;
    setHoverData(cursorSideData);
  }

  const handleDragEnd = (event: DragEndEvent) => { 
    const { active, over } = event;
    setHoverData(null);
    setActiveId(null);
    if (!over) return;
    
    if (active.id !== over.id) {
      const isNewRowAfter = over.id === DROP_AREA_ID_AFTER;
      const isNewRowBefore = over.id === DROP_AREA_ID_BEFORE;

      const cursorSide = getCursorSide(event)?.side;

      setRearrangedRows((rows) => {
        const activeRowItem = rows.flat().find(
          (rowItem) => rowItem.item._id.toString() === active.id.toString()
        );
        if (!activeRowItem) return rows;
        
        if (isNewRowAfter) {
          return swapToNewRowAfter(rows, activeRowItem);
        }
        if (isNewRowBefore) {
          return swapToNewRowBefore(rows, activeRowItem);
        }

        //Replace the over Item with the active item 
        const overRowItem = rows.flat().find(
          (rowItem) => rowItem.item._id.toString() === over.id.toString()
        );
        if (!overRowItem ) return rows;
        
        const [overY, overX] = overRowItem.item.position;

        // Calculate new X position based on cursor side
        const modification = cursorSide === "right" ? 1 : 0;
        const newX = overX + modification;
        const newPosition: [number, number] = [overY, newX];


        return swapToExistingRow({ rows, activeRowItem, newPosition });
      });
    }
  }

  const handleSaveRearrangement = () => {
    setSubmitting(true);
    console.log("PLACEHOLDER:save rearrangement")
    mutateGallery(gallery, false);
    setSubmitting(false);
  }
  return (
    <SideDrawer
      triggerButton={
        <Button className="w-full">
          <P>Rearrange Gallery Items</P>
          <LayoutTemplateIcon />
        </Button>
      }
      open={formOpen}
      onOpenChange={setFormOpen}
      title="Rearrange Gallery Items"
      description="Change the position of items in the gallery."
      actionButton={
        <Button
          onClick={handleSaveRearrangement}
          className="w-full"
          loading={submitting}
        >
          <P>Save</P>
        </Button>
      }
    >
      <div
        ref={containerRef}
        className="w-full h-full flex flex-col"
        style={{ gap: GAP }}
      >
        {isReady ? (
          <DndContext
            onDragStart={onDragStart}
            onDragMove={onDragMove}
            onDragEnd={handleDragEnd}
            collisionDetection={closestCenter}
            //dont add this back in unless you code a way to track the mouse position reliably
            //currently if restricted the mouse position gets stuck in the middle when the hover object is large
            // modifiers={[restrictToFirstScrollableAncestor]}
          >
            <Droppable id={DROP_AREA_ID_BEFORE} />
            {galleryRows.map((row, rowIndex) => {
              return (
                <div
                  key={rowIndex}
                  className={cn("flex justify-center flex-row items-center")}
                  style={{ gap: GAP }}
                >
                  <SortableContext
                    items={row.map(
                      (item) => `${rowIndex}-${item.item._id.toString()}`
                    )}
                  >
                    {row.map((cell) => {
                      const hoverSide =
                        hoverData?.id === cell.item._id.toString()
                          ? hoverData.side
                          : null;
                      return (
                        <SortableItem
                          key={cell.item._id.toString()}
                          processedItem={cell}
                          hoverSide={hoverSide}
                        />
                      );
                    })}
                  </SortableContext>
                </div>
              );
            })}
            <Droppable id={DROP_AREA_ID_AFTER} />

            <DragOverlay >
              {activeId ? (
                <OverlayItem
                  activeId={activeId}
                  processedItems={galleryRows}
                  containerWidth={containerWidth}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        ) : (
          <LoadingSpinner className="absolute-center" iconClass="size-10" />
        )}
      </div>
    </SideDrawer>
  );
}

export default RearrangeItems;


const  Droppable = ({ id }: { id: string }) => {
  const { setNodeRef, isOver } = useDroppable({
    id
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative w-full pb-[25%] border-2 border-dashed rounded-md text-border duration-300",
        isOver && "bg-muted text-muted-foreground border-muted-foreground shadow"
      )}
    >
      <div className="absolute-center">
        <PlusSquare className="mx-auto size-8" />
        <P className="text-center text-sm">New row</P>
      </div>
    </div>
  );
}
