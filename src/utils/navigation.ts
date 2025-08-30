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
  RETURN_QUERY_PARAM
} from "@/constants/clientRoutes";

export const getReturnPath = (returnKey: string): string => {
  const pathMap: Record<string, string> = {
    [DASHBOARD_RETURN_KEY]: DASHBOARD,
    [EDIT_PROFILE_RETURN_KEY]: EDIT_PROFILE,
    [EDIT_GALLERIES_RETURN_KEY]: EDIT_GALLERIES,
    [EDIT_TIMELINE_RETURN_KEY]: EDIT_TIMELINE,
    [LANDING_RETURN_KEY]: HOME,
  };

  return pathMap[returnKey] || DASHBOARD;
};

export const getReturnKey = (currentPath?: string): string => {
  if (!currentPath) return LANDING_RETURN_KEY;
  
  if (currentPath.includes(EDIT_GALLERIES)) return EDIT_GALLERIES_RETURN_KEY;
  if (currentPath.includes(EDIT_TIMELINE)) return EDIT_TIMELINE_RETURN_KEY;
  if (currentPath.includes(EDIT_PROFILE)) return EDIT_PROFILE_RETURN_KEY;
  if (currentPath.includes(HOME)) return LANDING_RETURN_KEY;
  return LANDING_RETURN_KEY;
};

export const makeReturnQueryParam = (key: string): string => { 
  return `?${RETURN_QUERY_PARAM}=${key}`;
}