import type { BackgroundImageUser } from "@/components/media/BackgroundImage";
import { NON_MEDIA_ASPECT_RATIO } from "@/constants/ui";
import type { OwnerTimelineSettingsType } from "@/hooks/useGalleryByUsernameAndName";
import { EntrySource } from "@/types/entry";
import {
  BaseGalleryType,
  GalleryType,
  UserVirtualGalleryType,
} from "@/types/gallery";
import { GalleryItem, GalleryItemTypes, isMediaGalleryItem } from "@/types/galleryItem";
import { GalleryRowItem } from "@/types/ui/dashboard";

/** Minimal gallery shape needed to resolve background/theme (owner + useCustomBackgroundSettings + optional overrides). */
export type GalleryBackgroundInput = Pick<
  BaseGalleryType,
  | "owner"
  | "useCustomBackgroundSettings"
  | "galleryTheme"
  | "galleryHeadingFont"
  | "galleryBodyFont"
  | "backgroundImage"
  | "backgroundTintHex"
  | "backgroundTintOpacity"
  | "backgroundBlur"
  | "backgroundTileCount"
>;

export interface ResolvedGalleryBackground {
  effectiveTheme: "light" | "dark";
  effectiveHeadingFont: string | null;
  effectiveBodyFont: string | null;
  resolvedBackgroundUser: BackgroundImageUser | null;
}

/**
 * Resolves effective theme, fonts, background user object, and upload category for a gallery page.
 * When useCustomBackgroundSettings is false, uses owner timeline settings; when true, uses gallery fields with owner fallback.
 */
export function resolveGalleryBackgroundAndTheme(
  gallery: GalleryBackgroundInput | null | undefined,
  ownerTimelineSettings: OwnerTimelineSettingsType | null | undefined
): ResolvedGalleryBackground {
  const useCustom = gallery?.useCustomBackgroundSettings ?? false;

  const effectiveTheme = useCustom
    ? (gallery?.galleryTheme ?? "light")
    : (ownerTimelineSettings?.timelineTheme ?? "light");

  const effectiveHeadingFont = useCustom
    ? (gallery?.galleryHeadingFont ?? null)
    : (ownerTimelineSettings?.timelineHeadingFont ?? null);

  const effectiveBodyFont = useCustom
    ? (gallery?.galleryBodyFont ?? null)
    : (ownerTimelineSettings?.timelineBodyFont ?? null);

  const ownerId = gallery?.owner ?? ownerTimelineSettings?._id;
  if (!ownerId) {
    return {
      effectiveTheme,
      effectiveHeadingFont,
      effectiveBodyFont,
      resolvedBackgroundUser: null,
    };
  }

  if (useCustom) {
    const resolvedBackgroundUser: BackgroundImageUser = {
      _id: ownerId,
      backgroundImage: gallery?.backgroundImage,
      backgroundTileCount: gallery?.backgroundTileCount ?? 0,
      backgroundTintHex: gallery?.backgroundTintHex ?? "#000000",
      backgroundTintOpacity: gallery?.backgroundTintOpacity ?? 0,
      backgroundBlur: gallery?.backgroundBlur ?? 0,
    };

    return {
      effectiveTheme,
      effectiveHeadingFont,
      effectiveBodyFont,
      resolvedBackgroundUser
    };
  }

  const resolvedBackgroundUser: BackgroundImageUser = {
    _id: ownerId,
    backgroundImage: ownerTimelineSettings?.backgroundImage,
    backgroundTileCount: ownerTimelineSettings?.backgroundTileCount ?? 0,
    backgroundTintHex: ownerTimelineSettings?.backgroundTintHex ?? "#000000",
    backgroundTintOpacity: ownerTimelineSettings?.backgroundTintOpacity ?? 0,
    backgroundBlur: ownerTimelineSettings?.backgroundBlur ?? 0,
  };
  return {
    effectiveTheme,
    effectiveHeadingFont,
    effectiveBodyFont,
    resolvedBackgroundUser
  };
}

export const getGalleryKey = (source: EntrySource) => {
  switch (source) {
    // case EntrySource.Curator:
    //   return "curatedGalleries";
    case EntrySource.Collector:
      return "collectedGalleries";
    case EntrySource.Creator:
      return "createdGalleries";
  }
};

/** Assumes gallery items are already sorted so that top left items are first*/
export const getFirstItemWithMedia = (galleryItems?: GalleryItem[]) => {
  return galleryItems?.find(
    (item) =>
      item.itemType === GalleryItemTypes.BlockchainAsset ||
      item.itemType === GalleryItemTypes.UserAsset
  );
}
export const getFirstBlockchainItem = (galleryItems?: GalleryItem[]) => {
  return galleryItems?.find(
    (item) =>
      item.itemType === GalleryItemTypes.BlockchainAsset
  );
}

export const convertToUserVirtualGallery = (
  gallery: GalleryType
): UserVirtualGalleryType => {

  //Find first item with media
  const firstItemWithMedia = getFirstItemWithMedia(gallery.items);

  return {
    ...gallery,
    items: firstItemWithMedia ? [firstItemWithMedia] : [],
    totalItems: gallery.items?.length || 0,
  };
};

/** If no items, returns -1 */
export const getLastGalleryRowIndex = (galleryItems?: GalleryItem[]) => {
  if (!galleryItems?.length) return -1; //
  return galleryItems.reduce((max, item) => {
    return Math.max(max, item.position[0]);
  }, 0);
};

export const getLastRowIndexFromGalleryRows = (galleryRows: GalleryRowItem[][]) => {
  if (!galleryRows.length) return -1;
  return galleryRows
    .flat()
    .reduce((max, rowItem) => Math.max(max, rowItem.item.position[0]), 0);
}

export const initializeGalleryRows = (galleryItems: GalleryItem[]): GalleryRowItem[][] => {
  //organize into rows based on position
  const rows: GalleryRowItem[][] = [];

  for (const item of galleryItems) {
    const [y, x] = item.position;
    const rowItem = {
      item,
      width: 0,
      height: 0,
    }
    if (rows[y]) {
      rows[y][x] = rowItem;
    } else {
      rows[y] = [rowItem];
    }
  }

  return rows;
}

/** Remove empty positions and update the rest of the items to match the new structure */
export const cleanGalleryRows = (galleryRows: GalleryRowItem[][]): GalleryRowItem[][] => {
  return galleryRows
    .map(row => row.filter((item)  => item !== undefined))
    .filter(row => row &&row.length > 0)
    .map((row, rowIndex) => 
      row.map((rowItem, colIndex) => ({
        ...rowItem,
        item: {
          ...rowItem.item,
          position: [rowIndex, colIndex] 
        }, 
      }))
    );
}
interface ProcessGalleryRowsProps {
  galleryRows: GalleryRowItem[][];
  gap: number;
  gapSmall?: number;
  padding?: number;
  useRowHeight: boolean;
  containerWidth: number;
  maxHeight: number;
}
export const processGalleryRows = ({
  galleryRows,
  gap,
  gapSmall,
  padding = 0,
  useRowHeight,
  containerWidth,
  maxHeight,
}: ProcessGalleryRowsProps): GalleryRowItem[][] => {
  if(!galleryRows?.length) return [];
  // calculate the width of each item
  // height of the images should be the same
  // use the height and aspect ratio for calculation (+ the gap)
  return galleryRows.map((row) => {
    const totalAspectRatio = row.reduce((acc, rowItem) => {

      //if the item is a GalleryRowItem, get the item from the item property
      const galleryItem = rowItem.item;

      const aspectRatio = isMediaGalleryItem(galleryItem)
        ? galleryItem.media?.aspectRatio || 1
        : NON_MEDIA_ASPECT_RATIO;
      return acc + aspectRatio;
    }, 0);

    //get the space between items 
    const gapOffset = row.length > 3 && !!gapSmall ? gapSmall : gap;
    
    const rowGapOffset = gapOffset * (row.length-1) + padding * 2
    const rowHeight = Math.min(
      (containerWidth - rowGapOffset) / totalAspectRatio,
      maxHeight
    );

    return row.map((rowItem) => {
      //if the item is a GalleryRowItem, get the item from the item property
      const galleryItem = rowItem.item;

      const aspectRatio = isMediaGalleryItem(galleryItem)
        ? galleryItem.media?.aspectRatio || 1
        : NON_MEDIA_ASPECT_RATIO;

      const cellHeight = Math.min(containerWidth / aspectRatio, maxHeight);

      const height = useRowHeight ? rowHeight : cellHeight;

      const width = aspectRatio * height;

      return {
        item: galleryItem,
        width,
        height: rowHeight,
      };
    });
  });
};

/** Remove active item from row and update positions as needed */
const removeFromRow = (row: GalleryRowItem[], activeRowItem: GalleryRowItem) => {
  const oldX = activeRowItem.item.position[1];
  const splitX = oldX + 1;
  const firstHalf = row.slice(0, oldX);
  const lastHalf = updateXPositions({
    rowSection: row.slice(splitX),
    startingIndex: oldX,
    modifier: 0,
  });
  return [...firstHalf, ...lastHalf];
}
export const swapToNewRowBefore = (rows: GalleryRowItem[][], activeRowItem: GalleryRowItem) => {
  const updatedRowItem: GalleryRowItem = {
    ...activeRowItem,
    item: {
      ...activeRowItem.item,
      position: [0, 0],
    },
  };
  //remove active item from old position
  const newRows: GalleryRowItem[][] = rows.map((row, index) => {
    if (index === activeRowItem.item.position[0]) {
      return removeFromRow(row, activeRowItem);
    }
    return row; // Keep other rows unchanged
  });

  //insert new row at the beginning
  newRows.unshift([updatedRowItem]);
  //update y positions
  return updateYPositions(newRows);
}
export const swapToNewRowAfter = (rows: GalleryRowItem[][], activeRowItem: GalleryRowItem) => {
  //don't rely on order of items
  const lastYIndex = getLastRowIndexFromGalleryRows(rows);
  const newestYIndex = lastYIndex + 1;
  const newPosition: [number, number] = [newestYIndex, 0];

  const updatedRowItem: GalleryRowItem = {
    ...activeRowItem,
    item: {
      ...activeRowItem.item,
      position: newPosition,
    },
  };

  //remove active item from old position
  const newRows: GalleryRowItem[][] = rows.map((row, index) => {
    if (index === activeRowItem.item.position[0]) {
      return removeFromRow(row, activeRowItem);
    }
    return row; // Keep other rows unchanged
  });

  // Add new row with updated item
  newRows[newestYIndex] = [updatedRowItem];

  return updateYPositions(newRows);
}

export const insertIntoNewRowAtIndex = (
  rows: GalleryRowItem[][],
  activeRowItem: GalleryRowItem,
  index: number
) => {
  const updatedRowItem: GalleryRowItem = {
    ...activeRowItem,
    item: {
      ...activeRowItem.item,
      position: [index, 0],
    },
  };
  //remove active item from old position
  const newRows: GalleryRowItem[][] = rows.map((row, index) => {
    if (index === activeRowItem.item.position[0]) {
      return removeFromRow(row, activeRowItem);
    }
    return row; // Keep other rows unchanged
  });

  const updatedRows = [
    ...newRows.slice(0, index),
    [updatedRowItem],
    ...newRows.slice(index),
  ];
  //update y positions
  return updateYPositions(updatedRows);
};


interface SwapToExistingRowProps {
  rows: GalleryRowItem[][];
  activeRowItem: GalleryRowItem;
  newPosition: [number, number];
}

export const swapToExistingRow = ({rows, activeRowItem, newPosition}: SwapToExistingRowProps) => {
  const updatedRowItem: GalleryRowItem = {
    ...activeRowItem,
    item: {
      ...activeRowItem.item,
      position: newPosition
    }
  }
  
  const updatedRows = rows.map((row, yIndex) => {
    const isOldRow = yIndex === activeRowItem.item.position[0];
    const isNewRow = yIndex === newPosition[0]

    let updatedRow = row;
    if (isOldRow) {
      updatedRow = removeFromRow(updatedRow, activeRowItem);
    }

    //insert the new item and update the row positions accordingly
    if (isNewRow) {
      let newX = newPosition[1]

      // if we just removed from this row and are placing the item after the active items previous spot
      // we need to subtract 1 from the modifier to account for the empty space
      const needToModifyX = isOldRow && newX > activeRowItem.item.position[1];
      if (needToModifyX) {
        newX -= 1;
        //update the x position of the updated row item too
        updatedRowItem.item.position[1] = newX;
      }
      const firstHalf = updatedRow.slice(0, newX);
      const lastHalf = updateXPositions({
        rowSection: updatedRow.slice(newX),
        startingIndex: newX,
        modifier: 1
      })
      updatedRow = [...firstHalf, updatedRowItem, ...lastHalf]
    }

    return updatedRow;
  })

  return updateYPositions(updatedRows);
}

interface UpdatePositionsProps {
  rowSection: GalleryRowItem[],
  startingIndex: number,
  modifier: number;
}
/** takes only the potion of a row that needs to be updated */
const updateXPositions = ({rowSection, startingIndex, modifier}: UpdatePositionsProps): GalleryRowItem[]=> {
  return rowSection.map((rowItem, xIndex) => { 
    const newXPosition = startingIndex + xIndex + modifier;
    const yPosition = rowItem.item.position[0];
    return {
      ...rowItem,
      item: {
        ...rowItem.item,
        position: [yPosition, newXPosition] 
      }
    }
  })
}

/** cleans out empty rows and updates y positions accordingly */
const updateYPositions = (galleryRows: GalleryRowItem[][]) => { 
  const updatedRows: GalleryRowItem[][] = [];
  let currentUpdatedIndex = 0;

  for (let i = 0; i < galleryRows.length; i++) {
    let row = galleryRows[i];
    // Skip empty rows
    if (!row || row.length === 0) {
      continue;
    }

    // If we've skipped any rows, or mismatched the index, update positions for items after this row
    const hasSkippedRow = currentUpdatedIndex !== i;
    const isMismatchedIndex = currentUpdatedIndex !== row[0].item.position[0];
    if (hasSkippedRow || isMismatchedIndex) {
      row = row.map(rowItem => {
        return {
          ...rowItem,
          item: {
            ...rowItem.item,
            position: [currentUpdatedIndex, rowItem.item.position[1]]
          }
        }
      })
    }

    updatedRows.push(row)
    if (updatedRows.length - 1 !== row[0].item.position[0]) {
      throw new Error("updateYPositions logic failed, index length mismatch");
    }
    currentUpdatedIndex++
  }

  return updatedRows
}