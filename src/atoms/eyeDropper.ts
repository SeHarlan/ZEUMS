import { atom } from "jotai";

/**
 * True while the native EyeDropper API is actively open.
 * Used to temporarily disable UI overlays/scrims that would block picking.
 */
export const isEyeDropperActiveAtom = atom<boolean>(false);

