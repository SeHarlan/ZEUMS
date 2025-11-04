import { BlockchainAssetEntry, EntrySource } from "./entry";

export interface GetSolanaAssetsProps {
  publicKeys: string[];
  source: EntrySource;
}

export interface GetSolanaAssetsPageProps {
  publicKey: string;
  source: EntrySource;
  /** starts at 0 */
  page: number;
  /** currently limited to <= 30 by Mallow API */
  limit?: number;
  searchTerm?: string;
}
export interface GetSolanaAssetsPageResponse {
  parsedAssets: ParsedBlockChainAsset[];
  skippedAssets: SkippedBlockChainAsset[];
  duplicateEditionCount: number;
  total: number;
  grandTotal?: number;
}

export interface GetSolanaAssetProps {
  mintAddress: string;
}

export interface GetEstimateMintDatesProps {
  mintAddresses: string[];
}
export interface DateMap {
  [mintAddress: string]: Date | null;
}

export type BlockchainCollection = {
  address: string;
  name?: string;
  image?: string;
  description?: string;
};

export type ParsedBlockChainAsset = Omit<
  BlockchainAssetEntry,
  "owner" | "source" | "date" | "_id"
> & {
  collection?: BlockchainCollection;
};

export enum SkippedAssetReason {
  LIKELY_SPAM = "likelySpam",
  COLLECTION_NFT = "collectionNft",
  BROKEN_CONTENT = "brokenContent",
}
export type SkippedBlockChainAsset = Pick<
  BlockchainAssetEntry,
  "tokenAddress" | "title" | "description"
  > & {
  reason: SkippedAssetReason;
};
