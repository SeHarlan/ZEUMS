import { BlockchainAssetEntry, EntrySource } from "./entry";

export interface GetSolanaAssetProps {
  publicKeys: string[];
  source: EntrySource;
}

export type ParsedBlockChainAsset = Omit<
  BlockchainAssetEntry,
  "owner" | "source" | "date" | "_id"
>;
