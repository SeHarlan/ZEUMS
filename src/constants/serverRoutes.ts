export const ASSETS_ROUTE = "/api/assets";
export const ASSETS_SOLANA_ROUTE = `${ASSETS_ROUTE}/solana`;
export const SINGLE_ASSET_SOLANA_ROUTE = (mintAddress: string) => `${ASSETS_SOLANA_ROUTE}/${mintAddress}`;

export const USER_ROUTE = "/api/user";

export const ENTRY_ROUTE = "/api/entry";
export const ENTRY_DATES_ROUTE = `${ENTRY_ROUTE}/dates`;
export const ENTRY_ENTRIES_ROUTE = `${ENTRY_ROUTE}/entries`;