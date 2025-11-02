import {
  ABOUT,
  ABOUT_RETURN_KEY,
  EDIT_GALLERIES,
  EDIT_GALLERIES_RETURN_KEY,
  EDIT_GALLERY,
  EDIT_GALLERY_ITEMS_RETURN_KEY,
  EDIT_PROFILE_ACCOUNT,
  EDIT_PROFILE_ACCOUNT_RETURN_KEY,
  EDIT_PROFILE_DISPLAY,
  EDIT_PROFILE_DISPLAY_RETURN_KEY,
  EDIT_TIMELINE,
  EDIT_TIMELINE_RETURN_KEY,
  GALLERY,
  GALLERY_RETURN_KEY,
  HOME,
  LANDING_RETURN_KEY,
  RETURN_QUERY_PARAM,
  SEARCH,
  SEARCH_RETURN_KEY,
  SOLANA_ASSET_RETURN_KEY,
  SOLANA_MEDIA,
  USER_GALLERY,
  USER_GALLERY_RETURN_KEY,
  USER_TIMELINE,
  USER_TIMELINE_RETURN_KEY
} from "@/constants/clientRoutes";

//a unique string that will never show up in a URL
const specialSplitter = "~";

export const getReturnPath = (returnKey: string): string => {
  const pathMap: Record<string, string> = {
    [ABOUT_RETURN_KEY]: ABOUT,
    [SEARCH_RETURN_KEY]: SEARCH,
    [EDIT_PROFILE_ACCOUNT_RETURN_KEY]: EDIT_PROFILE_ACCOUNT,
    [EDIT_PROFILE_DISPLAY_RETURN_KEY]: EDIT_PROFILE_DISPLAY,
    [EDIT_GALLERIES_RETURN_KEY]: EDIT_GALLERIES,
    [EDIT_TIMELINE_RETURN_KEY]: EDIT_TIMELINE,
    [LANDING_RETURN_KEY]: HOME,
    [GALLERY_RETURN_KEY]: GALLERY,
  };

  if (returnKey.includes(USER_TIMELINE_RETURN_KEY)) {
    const username = returnKey.split(specialSplitter)[1];
    return USER_TIMELINE(username);
  }

  if (returnKey.includes(USER_GALLERY_RETURN_KEY)) {
    const parts = returnKey.split(specialSplitter);
    const username = parts[1];
    const galleryname = parts[2];
    return USER_GALLERY(username, galleryname);
  }

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
    
    // if it doesnt contain EDIT GALLERIES we can assume its an id
    if (editingGalleryId && !editingGalleryId.includes(EDIT_GALLERIES)) {
      return EDIT_GALLERY_ITEMS_RETURN_KEY + specialSplitter + editingGalleryId;
    }
    return EDIT_GALLERIES_RETURN_KEY;
  }

  if (currentPath.includes(GALLERY)) { 
    const galleryId = currentPath
      .split("?")[0]
      .split(`${GALLERY}/`)
      .pop();
    if (galleryId && !galleryId.includes(GALLERY)) {
      // This is the old route format - we'll still support it for now
      return USER_GALLERY_RETURN_KEY + specialSplitter + galleryId;
    }
    return GALLERY_RETURN_KEY;
  }

  // Check if we're on a username/galleryname route (new format)
  const sections = currentPath.split("?")[0].split("/").filter(Boolean);
  if (sections.length === 2 && sections[0] && sections[1]) {
    // Could be either timeline or gallery - try to determine
    // If we got here and haven't matched other patterns, it's likely a gallery
    // We'll check if it's a known non-gallery pattern first
    if (sections[1] !== "timeline" && !currentPath.includes(EDIT_GALLERIES) && !currentPath.includes(GALLERY)) {
      // Assume it's a gallery: /username/galleryname
      return USER_GALLERY_RETURN_KEY + specialSplitter + sections[0] + specialSplitter + sections[1];
    }
    // Otherwise assume it's a timeline
    return USER_TIMELINE_RETURN_KEY + specialSplitter + sections[0];
  }


  if (currentPath.includes(EDIT_TIMELINE)) return EDIT_TIMELINE_RETURN_KEY;
  if (currentPath.includes(EDIT_PROFILE_ACCOUNT)) return EDIT_PROFILE_ACCOUNT_RETURN_KEY;
  if (currentPath.includes(EDIT_PROFILE_DISPLAY)) return EDIT_PROFILE_DISPLAY_RETURN_KEY;
  if (currentPath.includes(ABOUT)) return ABOUT_RETURN_KEY;
  if (currentPath.includes(SEARCH)) return SEARCH_RETURN_KEY;
  if (currentPath === HOME) return LANDING_RETURN_KEY;
  
  return LANDING_RETURN_KEY;
};

export const makeReturnQueryParam = (key: string): string => { 
  if(!key) return "";
  return `?${RETURN_QUERY_PARAM}=${key}`;
}