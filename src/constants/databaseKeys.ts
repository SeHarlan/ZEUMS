export const USER_MODEL_KEY = "User" as const;
export const USER_WALLET_VIRTUAL = "wallets" as const;
export const USER_CREATED_TIMELINE_VIRTUAL = "createdTimelineEntries" as const;
export const USER_COLLECTED_TIMELINE_VIRTUAL = "collectedTimelineEntries" as const;
export const USER_CREATED_GALLERIES_VIRTUAL = "createdGalleries" as const;
export const USER_COLLECTED_GALLERIES_VIRTUAL = "collectedGalleries" as const;

export const USER_AUTH_FOREIGN_KEY = "authUserId" as const;
export const USER_AUTH_VIRTUAL = "authUser" as const;

export const AUTH_USER_COLLECTION_NAME = "authUsers" as const;
export const AUTH_USER_MODEL_KEY = "AuthUser" as const;

export const WALLET_MODEL_KEY = "Wallet" as const;
export const WALLET_FOREIGN_KEY = "owner" as const;

export const ENTRY_MODEL_KEY = "Entry" as const;
export const ENTRY_DISCRIMINATOR_KEY = "entryType" as const;
export const ENTRY_FOREIGN_KEY = "owner" as const;
export const GALLERY_ENTRY_LOCAL_FIELD = "galleryId" as const;
export const GALLERY_ENTRY_VIRTUAL = "gallery" as const;

export const GALLERY_MODEL_KEY = "Gallery" as const;
export const GALLERY_ITEMS_VIRTUAL = "items" as const;
export const GALLERY_TOTAL_ITEMS_VIRTUAL = "totalItems" as const;
export const GALLERY_ITEMS_FOREIGN_KEY = "parentGalleryId" as const;
export const GALLERY_OWNER_FOREIGN_KEY = "owner" as const;

export const GALLERY_ITEM_MODEL_KEY = "GalleryItem" as const;
export const GALLERY_ITEM_DISCRIMINATOR_KEY = "itemType" as const;
export const GALLERY_ITEM_FOREIGN_KEY = "owner" as const;
export const GALLERY_ITEM_PARENT_FIELD = "parentGalleryId" as const;