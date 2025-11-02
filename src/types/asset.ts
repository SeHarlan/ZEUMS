import { BlockchainAssetEntry, EntrySource } from "./entry";

export interface GetSolanaAssetsProps {
  publicKeys: string[];
  source: EntrySource;
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
  likelySpam?: boolean;
};
