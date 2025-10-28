import { MediaOrigin, MediaType } from "@/types/media";
import { atom } from "jotai";
import { useFocusAtom } from "./useFocusAtom";

const erroredImageAtom = atom <Record<string, boolean> >({});

export const useHasErroredImage = (media: MediaType) => { 
  const key = media.origin === MediaOrigin.User ? media.imageCdn.cdnId : media.imageUrl;
  return useFocusAtom(erroredImageAtom, key);
}