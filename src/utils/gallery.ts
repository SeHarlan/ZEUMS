import { EntrySource } from "@/types/entry";

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
