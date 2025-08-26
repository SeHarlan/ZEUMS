import { CreateUserData } from "@/types/user";
import User, { CompleteUserVirtuals, UserDocument } from "../models/User";
import { handleServerError } from "@/utils/handleError";
import { CreateWalletData } from "@/types/wallet";
import Wallet from "../models/Wallet";

import mongoose from "mongoose";

export type FindOrCreateProps = {
  wallet: CreateWalletData
  createData: CreateUserData,
}

export async function findOrCreateUser({ wallet, createData }: FindOrCreateProps): Promise<UserDocument | null> {
  const mongooseSession = await mongoose.startSession();

  try {
    const walletModel = await Wallet.findOne({ address: wallet.address });
    
    if (walletModel) {
      const user = await User.findById(walletModel?.owner)
        .select("_id")
        .populate(CompleteUserVirtuals)
        .exec();

      
      //TODO: handle case where user is not found (shouldn't need this)
      // if (!user) {
      //   await walletModel.deleteOne();
      //   throw new Error("User not found for the given wallet");
      // }
      
      return user;
    } else {
      // If wallet does not exist, create a new user and wallet within a transaction
      mongooseSession.startTransaction();
      
      const user = new User(createData);
      await user.save({ session: mongooseSession });

      await Wallet.create([{
        owner: user._id,
        address: wallet.address,
        type: wallet.type,
      }], { session: mongooseSession });

      await mongooseSession.commitTransaction();

      return user;
    }
  } catch (error: unknown) {
    await mongooseSession.abortTransaction();

    handleServerError({ error, location: "findOrCreateUser" });
    return null
  } finally {
    mongooseSession.endSession();
  }
}
