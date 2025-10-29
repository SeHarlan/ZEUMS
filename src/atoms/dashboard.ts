import { EntrySource } from "@/types/entry";
import { GalleryItem } from "@/types/galleryItem";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";


export const editTimelineSourceAtom = atomWithStorage<EntrySource>(
  "editTimelineSource",
  EntrySource.Creator
);

export const addTimelineEntriesFormOpenAtom = atom<boolean>(false);
export const editProfileFormOpenAtom = atom<boolean>(false);
export const rearrangeEntriesDrawerOpenAtom = atom<boolean>(false);

export const newGalleryItemFormOpenAtom = atom<boolean>(false);
export const rearrangeGalleryItemsDrawerOpenAtom = atom<boolean>(false);

export const editGalleryItemAtom = atom<GalleryItem | null>(null);

export const editGalleryItemOpenAtom = atom<boolean>((get) => get(editGalleryItemAtom) !== null);