import { EntrySource } from "@/types/entry";
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