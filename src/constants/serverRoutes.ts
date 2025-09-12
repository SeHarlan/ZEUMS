export const ASSETS_ROUTE = "/api/assets";
export const ASSETS_SOLANA_ROUTE = `${ASSETS_ROUTE}/solana`;
export const SINGLE_ASSET_SOLANA_ROUTE = (mintAddress: string) => `${ASSETS_SOLANA_ROUTE}/${mintAddress}`;

export const USER_ROUTE = "/api/user";
export const USER_USERNAME_ROUTE = `${USER_ROUTE}/username`;
export const USER_EMAIL_ROUTE = `${USER_ROUTE}/email`;

export const ENTRY_ROUTE = "/api/entry";
export const ENTRY_DATES_ROUTE = `${ENTRY_ROUTE}/dates`;
export const ENTRY_ENTRIES_ROUTE = `${ENTRY_ROUTE}/entries`;

export const AUTH_ROUTE = "/api/auth";
export const AUTH_VERIFY_REQUEST_ROUTE = `${AUTH_ROUTE}/verify-request`;
export const AUTH_ERROR_ROUTE = `${AUTH_ROUTE}/error`;

//custom auth
export const PENDING_AUTH_VERIFICATION_ROUTE = `${AUTH_ROUTE}/pending-auth-verification`;
export const AUTH_EMAIL_SIGNIN = `${AUTH_ROUTE}/email-signin`;
