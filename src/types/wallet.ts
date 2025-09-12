import { Schema } from "mongoose";

export enum ChainIdsEnum {
  SOLANA = "solana",
  TEZOS = "tezos",
  // ETHEREUM = "ethereum",
  // ORDINAL = "ordinal",
}

export type WalletType = {
  address: string;
  owner: Schema.Types.ObjectId;
  type: ChainIdsEnum;
};

