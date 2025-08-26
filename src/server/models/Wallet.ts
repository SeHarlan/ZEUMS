import { WalletType } from "@/types/wallet";
import mongoose, { Schema, Document, Model } from "mongoose";
import { USER_MODEL_KEY, WALLET_FOREIGN_KEY, WALLET_MODEL_KEY } from "@/constants/databaseKeys";




export interface WalletDocument extends Document, WalletType { }

const WalletSchema: Schema = new Schema<WalletDocument>({
  address: { type: String, unique: true, required: true },
  [WALLET_FOREIGN_KEY]: {
    type: Schema.Types.ObjectId,
    ref: USER_MODEL_KEY,
    required: true,
  },
  type: { type: String, required: true },
});

const Wallet: Model<WalletDocument> =
  mongoose.models[WALLET_MODEL_KEY] ||
  mongoose.model<WalletDocument>(WALLET_MODEL_KEY, WalletSchema);

export default Wallet;
