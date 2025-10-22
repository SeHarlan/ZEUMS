import { EntrySource } from "@/types/entry";
import { atomWithStorage } from "jotai/utils";

export const editTimelineSourceAtom = atomWithStorage<EntrySource>("editTimelineSource", EntrySource.Creator);
