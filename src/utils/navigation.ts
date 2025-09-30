import { 
  EDIT_PROFILE,
  EDIT_GALLERIES,
  EDIT_TIMELINE,
  EDIT_PROFILE_RETURN_KEY,
  EDIT_GALLERIES_RETURN_KEY,
  EDIT_TIMELINE_RETURN_KEY,
  LANDING_RETURN_KEY,
  HOME,
  RETURN_QUERY_PARAM,
  SOLANA_MEDIA,
  SOLANA_ASSET_RETURN_KEY,
  ABOUT_RETURN_KEY,
  ABOUT,
  EDIT_PROFILE_ACCOUNT,
  EDIT_PROFILE_ACCOUNT_RETURN_KEY,
  EDIT_PROFILE_DISPLAY,
  EDIT_PROFILE_DISPLAY_RETURN_KEY,
  SEARCH,
  SEARCH_RETURN_KEY,
  EDIT_GALLERY_ITEMS_RETURN_KEY,
  EDIT_GALLERY
} from "@/constants/clientRoutes";

//a unique string that will never show up in a URL
const specialSplitter = "~";

export const getReturnPath = (returnKey: string): string => {
  const pathMap: Record<string, string> = {
    [ABOUT_RETURN_KEY]: ABOUT,
    [SEARCH_RETURN_KEY]: SEARCH,
    [EDIT_PROFILE_ACCOUNT_RETURN_KEY]: EDIT_PROFILE_ACCOUNT,
    [EDIT_PROFILE_DISPLAY_RETURN_KEY]: EDIT_PROFILE_DISPLAY,
    [EDIT_PROFILE_RETURN_KEY]: EDIT_PROFILE,
    [EDIT_GALLERIES_RETURN_KEY]: EDIT_GALLERIES,
    [EDIT_TIMELINE_RETURN_KEY]: EDIT_TIMELINE,
    [LANDING_RETURN_KEY]: HOME,
  };

  if (returnKey.includes(SOLANA_ASSET_RETURN_KEY)) {
    const id = returnKey.split(specialSplitter)[1];
    return SOLANA_MEDIA(id);
  }
  if (returnKey.includes(EDIT_GALLERY_ITEMS_RETURN_KEY)) {
    const id = returnKey.split(specialSplitter)[1];
    return EDIT_GALLERY(id);
  }
  return pathMap[returnKey] || HOME;
};

export const getReturnKey = (currentPath?: string, id?: string): string => {
  if (!currentPath) return LANDING_RETURN_KEY;

  if (id && currentPath.includes(SOLANA_MEDIA(id))) {
    return SOLANA_ASSET_RETURN_KEY + specialSplitter + id;
  }
  if (id && currentPath.includes(EDIT_GALLERY(id))) {
    return EDIT_GALLERY_ITEMS_RETURN_KEY + specialSplitter + id;
  }
  
  if (currentPath.includes(EDIT_GALLERIES)) {
    //remove query params
    //split on EDIT_GALLERIES and get the last part
    const editingGalleryId = currentPath
      .split("?")[0]
      .split(`${EDIT_GALLERIES}/`)
      .pop();
    // if it doesnt equal EDIT GALLERIES we can assume its an id

    if (editingGalleryId && editingGalleryId !== EDIT_GALLERIES) {
      return EDIT_GALLERY_ITEMS_RETURN_KEY + specialSplitter + editingGalleryId;
    }
    return EDIT_GALLERIES_RETURN_KEY;
  }
  if (currentPath.includes(EDIT_TIMELINE)) return EDIT_TIMELINE_RETURN_KEY;
  if (currentPath.includes(EDIT_PROFILE_ACCOUNT)) return EDIT_PROFILE_ACCOUNT_RETURN_KEY;
  if (currentPath.includes(EDIT_PROFILE_DISPLAY)) return EDIT_PROFILE_DISPLAY_RETURN_KEY;
  if (currentPath.includes(EDIT_PROFILE)) return EDIT_PROFILE_RETURN_KEY; //less specific, so after other specific edit profile paths
  if (currentPath.includes(ABOUT)) return ABOUT_RETURN_KEY;
  if (currentPath.includes(SEARCH)) return SEARCH_RETURN_KEY;
  if (currentPath.includes(HOME)) return LANDING_RETURN_KEY;
  return LANDING_RETURN_KEY;
};

export const makeReturnQueryParam = (key: string): string => { 
  if(!key) return "";
  return `?${RETURN_QUERY_PARAM}=${key}`;
}