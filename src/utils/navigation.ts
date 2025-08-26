import { 
  DASHBOARD, 
  EDIT_PROFILE,
  EDIT_GALLERIES,
  EDIT_TIMELINE,
  DASHBOARD_RETURN_KEY,
  EDIT_PROFILE_RETURN_KEY,
  EDIT_GALLERIES_RETURN_KEY,
  EDIT_TIMELINE_RETURN_KEY
} from "@/constants/clientRoutes";

export const getReturnPath = (from: string): string => {
  const pathMap: Record<string, string> = {
    [DASHBOARD_RETURN_KEY]: DASHBOARD,
    [EDIT_PROFILE_RETURN_KEY]: EDIT_PROFILE,
    [EDIT_GALLERIES_RETURN_KEY]: EDIT_GALLERIES,
    [EDIT_TIMELINE_RETURN_KEY]: EDIT_TIMELINE,
  };

  return pathMap[from] || DASHBOARD;
};

export const getSimpleFromParam = (currentPath?: string): string => {
  if (!currentPath) return DASHBOARD_RETURN_KEY;
  
  if (currentPath.includes(EDIT_GALLERIES)) return EDIT_GALLERIES_RETURN_KEY;
  if (currentPath.includes(EDIT_TIMELINE)) return EDIT_TIMELINE_RETURN_KEY;
  if (currentPath.includes(EDIT_PROFILE)) return EDIT_PROFILE_RETURN_KEY;
  return DASHBOARD_RETURN_KEY;
};
