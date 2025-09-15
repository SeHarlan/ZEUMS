// Types for Mallow API responses
// https://docs.mallow.art/api/explore-artworks/

export interface MallowExploreResponse {
  result: MallowArtwork[];
  nextPage: number;
  total: number;
}
export interface MallowExploreRequest {
  page: number;
  sort:
    | "recently-listed"
    | "recently-sold"
    | "trending"
    | "ending-soon"
    | "most-liked"
    | "most-liked-24h"
    | "alphabetical"
    | "lowest-price";
  filter: {
    search: string;
  };
}
export interface MallowArtwork {
  /** Mint address */
  mintAccount: string;
  name: string;
  description?: string;
  metadataUrl?: string;
  imageUrl?: string;
  videoUrl?: string;
  htmlUrl?: string;
  modelUrl?: string;
  supply: number;
  maxSupply?: number;
  editionNumber?: number;
  editionAccount: string;
  masterEditionMint?: string;
  source?: "objkt" | "mallow" | "exchange-art" | string; //currently not all source types are known
  /** Wallet address */
  owner: string;
  creator: string;
  /** contains the creator addresses */
  royalties?: MallowRoyalties;
  attributes?: MallowAttribute[];
  tags?: string[];
  /** Mallow url */
  url: string;
}

export interface MallowAttribute {
  trait_type: string;
  value: string | number;
}

export interface MallowRoyalties {
  /** The royalty fee in basis points (1 BPS = 0.01%, e.g., 500 BPS = 5%) */
  feeBPS: number;
  /** Array of royalty recipients and their share percentages */
  shares: MallowRoyaltyShare[];
}

export interface MallowRoyaltyShare {
  /** The wallet address of the royalty recipient (creator address) */
  address: string;
  share: number;
  verified: boolean;
}

