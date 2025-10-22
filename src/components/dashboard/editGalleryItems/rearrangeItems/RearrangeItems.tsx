import LoadingSpinner from "@/components/general/LoadingSpinner"
import SideDrawer from "@/components/general/SideDrawer"
import { P } from "@/components/typography/Typography"
import { Button } from "@/components/ui/button"
import { GALLERY_ITEM_POSITIONS_ROUTE } from "@/constants/serverRoutes"
import { useUser } from "@/context/UserProvider"
import useGalleryById from "@/hooks/useGalleryById"
import useGalleryDimensions from "@/hooks/useGalleryDimensions"
import { GalleryItemPositionUpdate } from "@/types/galleryItem"
import { GalleryRowItem } from "@/types/ui/dashboard"
import { cleanGalleryRows, initializeGalleryRows, insertIntoNewRowAtIndex, processGalleryRows, swapToExistingRow, swapToNewRowAfter, swapToNewRowBefore } from "@/utils/gallery"
import { handleClientError } from "@/utils/handleError"
import { cn } from "@/utils/ui-utils"
import { closestCenter, DndContext, DragEndEvent, DragMoveEvent, DragOverlay, DragStartEvent, useDroppable } from "@dnd-kit/core"
import { rectSortingStrategy, SortableContext } from "@dnd-kit/sortable"
import axios from "axios"
import { LayoutTemplateIcon, PlusIcon, PlusSquareIcon } from "lucide-react"
import type { BulkWriteResult } from "mongodb"
import { FC, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import SortableItem, { OverlayItem } from "./SortableItem"


const GAP = 12;
const DROP_AREA_ID_AFTER = "droppable-area-after";
const DROP_AREA_ID_BEFORE = "droppable-area-before";
const INSERT_ROW_ID_PREFIX = "insert-row-";
const MAX_HEIGHT_RATIO = 0.33;

interface RearrangeItemsProps {
  galleryId: string;
}

interface HoverData {
  id: string;
  side: "left" | "right";

}
const RearrangeItems: FC<RearrangeItemsProps> = ({ galleryId }) => { 
  const { gallery, mutateGallery } = useGalleryById(galleryId);
  const { revalidateUser } = useUser();

  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoverData, setHoverData] = useState<HoverData | null>(null);
  const [rearrangedRows, setRearrangedRows] = useState<GalleryRowItem[][]>([]);
  
  const { containerRef, containerWidth, maxHeight, isReady, getDimensions } =
    useGalleryDimensions(false, MAX_HEIGHT_RATIO);

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
    if (!gallery?.items || !formOpen) return;
    const initRows = initializeGalleryRows(gallery.items);
    //remove stray empty rows/cells and update positions
    const cleanedRows = cleanGalleryRows(initRows);
    setRearrangedRows(cleanedRows);

    //reset rearrangedRows when the form is closed
    return () => setRearrangedRows([]);
  }, [gallery?.items, formOpen]);

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
      const overIdString = over.id.toString();
      const isInsertRow = overIdString.startsWith(INSERT_ROW_ID_PREFIX);
      const insertRowIndex = isInsertRow ? parseInt(overIdString.split(INSERT_ROW_ID_PREFIX)[1]) : null;

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

        if (insertRowIndex) {
          return insertIntoNewRowAtIndex(rows, activeRowItem, insertRowIndex);
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

  const handleSaveRearrangement = async () => {
    if (!gallery) return;
    
    // Get the current items from the original gallery
    const originalItems = gallery.items || [];
    const originalPositions = new Map(
      originalItems.map((item) => [item._id.toString(), item.position])
    );

    // Get the rearranged items
    const rearrangedItems = galleryRows.flat().map((item) => item.item);
    
    // Filter to just items with changed positions
    const updatedItems = rearrangedItems.filter((item) => {
      const originalPosition = originalPositions.get(item._id.toString());
      if (!originalPosition) return false; //type safety

      return (
        item.position[0] !== originalPosition[0] || 
        item.position[1] !== originalPosition[1]
      );
    });

    // No changes made
    if (!updatedItems.length) {
      setFormOpen(false);
      return;
    }

    const positionsPayload: GalleryItemPositionUpdate[] = updatedItems.map((item) => ({
      _id: item._id.toString(),
      position: item.position,
    }));

    setSubmitting(true);

    axios
      .patch<{ bulkWriteResult: BulkWriteResult }>(GALLERY_ITEM_POSITIONS_ROUTE, positionsPayload)
      .then((response) => {
        const { bulkWriteResult } = response.data;

        if (bulkWriteResult.modifiedCount < positionsPayload.length) {
          toast.info("Some gallery item positions could not be updated.");
        } else {
          toast.success("Gallery item positions updated!");
        }

        // Update the gallery context with the updated positions
        mutateGallery((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            items: rearrangedItems,
          };
        }, false);

        // Revalidate user if the first two rows changed
        // Will effect user gallery cards and gallery entries
        if (positionsPayload.some((payloadItem) => payloadItem.position[0] < 2)) {
          revalidateUser();
        }

        setFormOpen(false);
      })
      .catch((error) => {
        toast.error("Failed to update gallery item positions.");
        handleClientError({
          error,
          location: "RearrangeItems_handleSaveRearrangement",
        });
      })
      .finally(() => {
        setSubmitting(false);
      });
  }
  return (
    <SideDrawer
      triggerButton={
        <Button className="w-full" variant="outline">
          <P>Rearrange Items</P>
          <LayoutTemplateIcon className="hidden md:block" />
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
      >
        {isReady ? (
          <DndContext
            onDragStart={onDragStart}
            onDragMove={onDragMove}
            onDragEnd={handleDragEnd}
            collisionDetection={closestCenter}
            //don't add this back in unless you code a way to track the mouse position reliably
            //currently if restricted the mouse position gets stuck in the middle when the hover object is large
            // modifiers={[restrictToFirstScrollableAncestor]}
          >
            <Droppable id={DROP_AREA_ID_BEFORE} />

            {galleryRows.map((row, rowIndex) => {
              const insertRowId = INSERT_ROW_ID_PREFIX + rowIndex;
              return (
                <div key={rowIndex}>
                  {rowIndex !== 0 && (
                    <DroppableInsertRow key={insertRowId} id={insertRowId} />
                  )}
                  <div
                    className={cn("flex justify-center flex-row items-center")}
                    style={{ gap: GAP }}
                  >
                    <SortableContext
                      items={row.map((item) => item.item._id.toString())}
                      strategy={rectSortingStrategy}
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
                </div>
              );
            })}
            <Droppable id={DROP_AREA_ID_AFTER} />

            <DragOverlay>
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
        "relative w-full pb-[25%] border-2 border-dashed rounded-md text-border duration-300 my-4",
        isOver &&
          "bg-muted border-muted-foreground shadow  text-muted-foreground"
      )}
    >
      <div className="absolute-center w-full">
        <PlusSquareIcon className="mx-auto size-8" />
        <P className={cn("text-center text-sm font-bold", isOver ? "text-muted-foreground" : "text-muted-foreground/50")}>Drop here to create a new row</P>
      </div>
    </div>
  );
}

const DroppableInsertRow = ({ id }: { id: string }) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative w-full border-2 border-dashed rounded text-muted-foreground/50 duration-300 my-2",
        isOver &&
          "bg-muted border-muted-foreground shadow  text-muted-foreground"
      )}
    >
      <PlusIcon className="mx-auto size-4" />
    </div>
  );
};

