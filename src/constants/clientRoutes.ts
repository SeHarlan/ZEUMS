import { EditProfileTab, EditProfileTabQueryParam } from "@/types/ui/dashboard";
import { ChainIdsEnum } from "@/types/wallet";

export const HOME = '/'; //landing page
export const SEARCH = '/search';

export const ABOUT = '/about';

export const COMING_SOON = '/coming-soon';
export const NOT_FOUND = '/not-found';

export const DASHBOARD = '/dashboard';
export const EDIT_PROFILE = `${DASHBOARD}/profile`
export const EDIT_PROFILE_ACCOUNT = `${EDIT_PROFILE}?${EditProfileTabQueryParam}=${EditProfileTab.ACCOUNT}`;
export const EDIT_PROFILE_DISPLAY = `${EDIT_PROFILE}?${EditProfileTabQueryParam}=${EditProfileTab.DISPLAY}`;
export const EDIT_GALLERIES = `${DASHBOARD}/galleries`;
export const EDIT_GALLERY = (galleryId: string) => `${EDIT_GALLERIES}/${galleryId}`;
export const EDIT_TIMELINE = `${DASHBOARD}/timeline`;

export const MEDIA = '/media';
export const USER_MEDIA = (id: string) => `${MEDIA}/user/${id}`;
export const SOLANA_MEDIA = (mintAddress: string) => `${MEDIA}/solana/${mintAddress}`;
export const TEZOS_MEDIA = (mintAddress: string) => `${MEDIA}/tezos/${mintAddress}`;

export const TIMELINES = '/timelines';
export const USER_TIMELINE = (username: string) => `/${username}`;
export const GALLERIES = '/galleries';
export const GALLERY = '/gallery';
export const USER_GALLERY = (galleryId: string) => `${GALLERY}/${galleryId}`;
export const BLOCKCHAIN_MEDIA_PATHS = {
  [ChainIdsEnum.SOLANA]: SOLANA_MEDIA,
  [ChainIdsEnum.TEZOS]: TEZOS_MEDIA,
};

//used in 'from' query param to return to the correct page
export const RETURN_QUERY_PARAM = "from";

export const LANDING_RETURN_KEY = "landing"; //HOME
export const SEARCH_RETURN_KEY = "search";
export const ABOUT_RETURN_KEY = "about";
export const DASHBOARD_RETURN_KEY = "dashboard";
export const EDIT_PROFILE_RETURN_KEY = "edit-profile";
export const EDIT_PROFILE_ACCOUNT_RETURN_KEY = "edit-profile-account";
export const EDIT_PROFILE_DISPLAY_RETURN_KEY = "edit-profile-display";
export const EDIT_GALLERIES_RETURN_KEY = "edit-galleries";
export const EDIT_GALLERY_ITEMS_RETURN_KEY = "edit-gallery";
export const EDIT_TIMELINE_RETURN_KEY = "edit-timeline";

export const SOLANA_ASSET_RETURN_KEY = "solana";
export const USER_TIMELINE_RETURN_KEY = "user-timeline";
export const USER_GALLERY_RETURN_KEY = "user-gallery";
export const GALLERY_RETURN_KEY = "gallery";



