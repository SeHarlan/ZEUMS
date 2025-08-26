import { EditProfileTab, EditProfileTabQueryParam } from "@/types/ui/dashboard";

export const HOME = '/';

export const ABOUT = '/about';

export const DASHBOARD = '/dashboard';
export const EDIT_PROFILE = `${DASHBOARD}/profile`
export const EDIT_PROFILE_ACCOUNT = `${EDIT_PROFILE}?${EditProfileTabQueryParam}=${EditProfileTab.ACCOUNT}`;
export const EDIT_GALLERIES = `${DASHBOARD}/galleries`;
export const EDIT_TIMELINE = `${DASHBOARD}/timeline`;


export const MEDIA = '/media';
export const USER_MEDIA = `${MEDIA}/user`;
export const SOLANA_MEDIA = `${MEDIA}/solana`;
export const TEZOS_MEDIA = `${MEDIA}/tezos`;

//used in 'from' query param to return to the correct page

export const RETURN_QUERY_PARAM = "from";
export const DASHBOARD_RETURN_KEY = "dashboard";
export const EDIT_PROFILE_RETURN_KEY = "edit-profile";
export const EDIT_GALLERIES_RETURN_KEY = "edit-galleries";
export const EDIT_TIMELINE_RETURN_KEY = "edit-timeline";

