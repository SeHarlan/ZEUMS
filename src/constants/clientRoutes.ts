import { EditProfileTab, EditProfileTabQueryParam } from "@/types/ui/dashboard";
import { ChainIdsEnum } from "@/types/wallet";

export const HOME = '/'; //landing page

export const ABOUT = '/about';

export const COMING_SOON = '/coming-soon';

export const DASHBOARD = '/dashboard';
export const EDIT_PROFILE = `${DASHBOARD}/profile`
export const EDIT_PROFILE_ACCOUNT = `${EDIT_PROFILE}?${EditProfileTabQueryParam}=${EditProfileTab.ACCOUNT}`;
export const EDIT_PROFILE_DISPLAY = `${EDIT_PROFILE}?${EditProfileTabQueryParam}=${EditProfileTab.DISPLAY}`;
export const EDIT_GALLERIES = `${DASHBOARD}/galleries`;
export const EDIT_TIMELINE = `${DASHBOARD}/timeline`;


export const MEDIA = '/media';
export const USER_MEDIA = (id: string) => `${MEDIA}/user/${id}`;
export const SOLANA_MEDIA = (mintAddress: string) => `${MEDIA}/solana/${mintAddress}`;
export const TEZOS_MEDIA = (mintAddress: string) => `${MEDIA}/tezos/${mintAddress}`;

export const BLOCKCHAIN_MEDIA_PATHS = {
  [ChainIdsEnum.SOLANA]: SOLANA_MEDIA,
  [ChainIdsEnum.TEZOS]: TEZOS_MEDIA,
};

//used in 'from' query param to return to the correct page
export const RETURN_QUERY_PARAM = "from";

export const LANDING_RETURN_KEY = "landing"; //HOME
export const DASHBOARD_RETURN_KEY = "dashboard";
export const EDIT_PROFILE_RETURN_KEY = "edit-profile";
export const EDIT_GALLERIES_RETURN_KEY = "edit-galleries";
export const EDIT_TIMELINE_RETURN_KEY = "edit-timeline";

export const SOLANA_ASSET_RETURN_KEY = "solana";

