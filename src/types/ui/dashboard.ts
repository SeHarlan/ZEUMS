import { GalleryItem } from "../galleryItem";

export enum EditProfileTab {
  ACCOUNT = "account",
  DISPLAY = "display",
}

export const EditProfileTabQueryParam = "tab";

// Define this outside components to avoid recreating it
export const VALID_PROFILE_TABS = new Set(Object.values(EditProfileTab));

export function isEditProfileTab(value: string | null): value is EditProfileTab {
  return value !== null && VALID_PROFILE_TABS.has(value as EditProfileTab);
}



export enum EditTimelineTab { 
  ARTIST = "artist",
  COLLECTOR = "collector",
  CURATOR = "curator",
}

export const EditTimelineTabQueryParam = "tab";

export const VALID_TIMELINE_TABS = new Set(Object.values(EditTimelineTab)); 

export function isEditTimelineTab(value: string | null): value is EditTimelineTab {
  return value !== null && VALID_TIMELINE_TABS.has(value as EditTimelineTab);
}

export interface GalleryRowItem {
  item: GalleryItem;
  width: number
  height: number
}
