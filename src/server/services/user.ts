import { CreateUserData } from "@/types/user";
import User, { CompleteUserVirtuals, UserDocument } from "../models/User";
import { handleServerError } from "@/utils/handleError";
import { CreateWalletData } from "@/types/wallet";
import Wallet from "../models/Wallet";
import mongoose from "mongoose";
import { Account } from "next-auth";

export type FindOrCreateProps = {
  createData: CreateUserData,
  wallet?: CreateWalletData
  account?: Account
}

export async function findOrCreateUser({
  wallet,
  createData,
  account,
}: FindOrCreateProps): Promise<UserDocument | null> {
  const mongooseSession = await mongoose.startSession();

  try {
    if (wallet) {
      return handleWithWallet({ wallet, createData, mongooseSession });
    }

    if (account) {
      return handleWithAccount({account, createData });
    }

    // If neither wallet nor account is provided throw an error, on catch null will be returned
    throw new Error("No wallet or account provided");
  } catch (error: unknown) {
    await mongooseSession.abortTransaction();

    handleServerError({ error, location: "services-user_findOrCreateUser" });
    return null;
  } finally {
    mongooseSession.endSession();
  }
}

interface HandleWithAccountProps {
  account: Account;
  createData: CreateUserData;
}

const handleWithAccount = async ({
  account,
  createData,
}: HandleWithAccountProps) => {
  // Find user by providerAccountId and provider for maximum reliability
  const user = await User.findOne({
    accounts: {
      $elemMatch: {
        providerAccountId: account.providerAccountId,
        provider: account.provider,
      },
    },
  });
  

  if (user) {
    return user;
  }

  // If user doesn't exist, create a new one
  const newUser = new User({
    ...createData,
    accounts: [account],
  });
  //errors handled in parent function

  await newUser.save();
  return newUser;
}
interface HandleWithWalletProps {
  wallet: CreateWalletData;
  createData: CreateUserData;
  mongooseSession: mongoose.mongo.ClientSession;
}
const handleWithWallet = async ({
  wallet,
  createData,
  mongooseSession,
}: HandleWithWalletProps) => {
  const walletModel = await Wallet.findOne({ address: wallet.address });

  if (walletModel) {
    const user = await User.findById(walletModel?.owner)
      .select("_id")
      .populate(CompleteUserVirtuals)
      .exec();

      if (!user) {
      //TODO: handle case where user is not found (shouldn't need this)
      // await walletModel.deleteOne();
      
      throw new Error("User not found for the given wallet");
    }

    return user;
  } else {
    // If wallet does not exist, create a new user and wallet within a transaction
    mongooseSession.startTransaction();

    const user = new User(createData);
    await user.save({ session: mongooseSession });

    await Wallet.create(
      [
        {
          owner: user._id,
          address: wallet.address,
          type: wallet.type,
        },
      ],
      { session: mongooseSession }
    ) //errors handled in parent function

    await mongooseSession.commitTransaction();

    return user;
  }
}
