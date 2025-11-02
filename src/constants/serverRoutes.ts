export const API_ROUTE = "/api";

export const ASSETS_ROUTE = `${API_ROUTE}/assets`;
export const ASSETS_SOLANA_ROUTE = `${ASSETS_ROUTE}/solana`;
export const SINGLE_ASSET_SOLANA_ROUTE = (mintAddress: string) => `${ASSETS_SOLANA_ROUTE}/${mintAddress}`;

export const USER_ROUTE = `${API_ROUTE}/user`;
export const USER_USERNAME_ROUTE = `${USER_ROUTE}/username`;
export const USER_EMAIL_ROUTE = `${USER_ROUTE}/email`;
export const USER_WALLET_ROUTE = `${USER_ROUTE}/wallet`;
export const WALLET_ADDRESS_PARAM = "walletAddress";

export const ENTRY_ROUTE = `${API_ROUTE}/entry`;
export const ENTRY_DATES_ROUTE = `${ENTRY_ROUTE}/dates`;
export const ENTRY_ENTRIES_ROUTE = `${ENTRY_ROUTE}/entries`;

export const GALLERY_ROUTE = `${API_ROUTE}/gallery`;

export const GALLERY_ITEM_ROUTE = `${API_ROUTE}/gallery-item`;
export const GALLERY_ITEM_ITEMS_ROUTE = `${GALLERY_ITEM_ROUTE}/items`;
export const GALLERY_ITEM_POSITIONS_ROUTE = `${GALLERY_ITEM_ROUTE}/positions`;

//public routes
export const PUBLIC_ROUTE = `${API_ROUTE}/public`;
export const PUBLIC_USER_ROUTE = `${PUBLIC_ROUTE}/user`;
export const PUBLIC_USER_BY_USERNAME_ROUTE = (username: string) =>
  `${PUBLIC_USER_ROUTE}/${username}`;
export const PUBLIC_GALLERY_ROUTE = `${PUBLIC_ROUTE}/gallery`;

export const GALLERY_BY_USERNAME_AND_NAME_ROUTE = (
  username: string,
  galleryName: string
) => `${PUBLIC_GALLERY_ROUTE}/${username}/${galleryName}`;

/** Deprecated: use GALLERY_BY_USERNAME_AND_NAME_ROUTE instead */
export const GALLERY_BY_ID_ROUTE = (id: string) => `${PUBLIC_ROUTE}/galleryById/${id}`;


export const SEARCH_ROUTE = `${PUBLIC_ROUTE}/search`;
export const SEARCH_ASSETS_ROUTE = `${SEARCH_ROUTE}/assets`;
export const SEARCH_PARAM = "search";
export const SEARCH_RANDOMIZE_KEY = 'EV3s-SECRET-RANDOMIZER'

export const AUTH_ROUTE = `${API_ROUTE}/auth`;
export const AUTH_VERIFY_REQUEST_ROUTE = `${AUTH_ROUTE}/verify-request`;
export const AUTH_ERROR_ROUTE = `${AUTH_ROUTE}/error`;

//custom auth
export const PENDING_AUTH_VERIFICATION_ROUTE = `${AUTH_ROUTE}/pending-auth-verification`;
export const AUTH_EMAIL_SIGNIN = `${AUTH_ROUTE}/email-signin`;
