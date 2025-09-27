import { EntrySource } from "@/types/entry";
import { GalleryType, UserVirtualGalleryType } from "@/types/gallery";
import { GalleryItemTypes } from "@/types/galleryItem";

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

export const convertToUserVirtualGallery = (
  gallery: GalleryType
): UserVirtualGalleryType => {

  //Find first item with media 
  //Assumes gallery items are already sorted so that top left items are first
  
  const firstItemWithMedia = gallery.items?.find(
    (item) =>
      item.itemType === GalleryItemTypes.BlockchainAsset ||
      item.itemType === GalleryItemTypes.UserAsset
  );
  return {
    ...gallery,
    items: firstItemWithMedia ? [firstItemWithMedia] : [],
  };
};

/** If no items, returns -1 */
export const getLastGalleryRowIndex = (gallery: GalleryType) => {
  if (!gallery.items?.length) return -1; //
  return gallery.items.reduce((max, item) => {
    return Math.max(max, item.position[0]);
  }, 0);
};