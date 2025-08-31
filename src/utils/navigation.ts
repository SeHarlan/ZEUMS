import { 
  DASHBOARD, 
  EDIT_PROFILE,
  EDIT_GALLERIES,
  EDIT_TIMELINE,
  DASHBOARD_RETURN_KEY,
  EDIT_PROFILE_RETURN_KEY,
  EDIT_GALLERIES_RETURN_KEY,
  EDIT_TIMELINE_RETURN_KEY,
  LANDING_RETURN_KEY,
  HOME,
  RETURN_QUERY_PARAM,
  SOLANA_MEDIA,
  SOLANA_ASSET_RETURN_KEY
} from "@/constants/clientRoutes";

export const getReturnPath = (returnKey: string): string => {
  const pathMap: Record<string, string> = {
    [DASHBOARD_RETURN_KEY]: DASHBOARD,
    [EDIT_PROFILE_RETURN_KEY]: EDIT_PROFILE,
    [EDIT_GALLERIES_RETURN_KEY]: EDIT_GALLERIES,
    [EDIT_TIMELINE_RETURN_KEY]: EDIT_TIMELINE,
    [LANDING_RETURN_KEY]: HOME,
  };

  if (returnKey.includes(SOLANA_ASSET_RETURN_KEY)) {
    const id = returnKey.split("-")[1];
    return SOLANA_MEDIA(id);
  }
  return pathMap[returnKey] || DASHBOARD;
};

export const getReturnKey = (currentPath?: string, id?: string): string => {
  if (!currentPath) return LANDING_RETURN_KEY;

  if (id && currentPath.includes(SOLANA_MEDIA(id))) {
    return SOLANA_ASSET_RETURN_KEY + "-" + id;
  }
  
  if (currentPath.includes(EDIT_GALLERIES)) return EDIT_GALLERIES_RETURN_KEY;
  if (currentPath.includes(EDIT_TIMELINE)) return EDIT_TIMELINE_RETURN_KEY;
  if (currentPath.includes(EDIT_PROFILE)) return EDIT_PROFILE_RETURN_KEY;
  if (currentPath.includes(HOME)) return LANDING_RETURN_KEY;
  return LANDING_RETURN_KEY;
};

export const makeReturnQueryParam = (key: string): string => { 
  if(!key) return "";
  return `?${RETURN_QUERY_PARAM}=${key}`;
}