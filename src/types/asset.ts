import { BlockchainAssetEntry, EntrySource } from "./entry";

export interface GetSolanaAssetsProps {
  publicKeys: string[];
  source: EntrySource;
}

export interface GetSolanaAssetProps {
  mintAddress: string;
}

export type ParsedBlockChainAsset = Omit<
  BlockchainAssetEntry,
  "owner" | "source" | "date" | "_id"
>;
