import { CreateUserData } from "@/types/user";
import User from "../models/User";
import { handleServerError } from "@/utils/handleError";
import { CreateWalletData } from "@/types/wallet";
import Wallet from "../models/Wallet";
import mongoose from "mongoose";
import { Account, User as NextAuthUser } from "next-auth";

export type FindOrCreateProps = {
  createData: CreateUserData,
  wallet?: CreateWalletData
  account?: Account
}
/**
 * @param createData - The data to create a user if not found
 * @param wallet - The wallet to find or create a user for
 * @param account - The account to find or create a user for
 * @returns the id and publicKey or email of the user for auth purposes
 */
export async function findOrCreateUser({
  wallet,
  createData,
  account,
}: FindOrCreateProps): Promise<NextAuthUser | null> {
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
  // First, check if user exists by email for maximum account unification
  if (createData.email) {
    //fetch the mongoose Model we need to add accounts
    const existingUserByEmail = await User.findOne({
      email: createData.email,
    })
      .select("_id email accounts")
      .exec(); //
    console.log("🚀 ~ handleWithAccount ~ existingUserByEmail:", existingUserByEmail)

    if (existingUserByEmail) {
      // Ensure accounts array exists
      if (!existingUserByEmail.accounts) {
        existingUserByEmail.accounts = [];
      }

      // Check if this provider account already exists for this user
      const hasProviderAccount = existingUserByEmail.accounts.some(
        (acc) => acc.provider === account.provider && acc.providerAccountId === account.providerAccountId
      );

      if (!hasProviderAccount) {
        // Add the new provider account to existing user
        existingUserByEmail.accounts.push(account);
        await existingUserByEmail.save();
      }

      const sessionUser: NextAuthUser = {
        id: existingUserByEmail._id.toString(),
        email: existingUserByEmail.email,
      };

      return sessionUser;
    }
  }

  // If no email match, check if user exists by providerAccountId and provider for exact match
  const existingUserByProvider = await User.findOne({
    accounts: {
      $elemMatch: {
        providerAccountId: account.providerAccountId,
        provider: account.provider,
      },
    },
  })
    .select("_id email")
    .lean()
    .exec();

  if (existingUserByProvider) {
    const sessionUser: NextAuthUser = {
      id: existingUserByProvider._id.toString(),
      email: existingUserByProvider.email,
    };
    return sessionUser;
  }

  // If no user exists with this email or provider, create a new one
  const newUser = new User({
    ...createData,
    accounts: [account],
  })
  //errors handled in parent function

  await newUser.save();

  const sessionUser: NextAuthUser = {
    id: newUser._id.toString(),
    email: newUser.email,
  };
  return sessionUser;
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
    const user = await User.findById<NextAuthUser>(walletModel?.owner)
      .select("_id")
      .lean()
      .exec();

    if (!user) {
      //TODO: handle case where user is not found (shouldn't need this)
      // await walletModel.deleteOne();
      throw new Error("User not found for the given wallet");
    }

    const sessionUser: NextAuthUser = {
      id: user._id.toString(),
      publicKey: wallet.address,
    };

    return sessionUser;
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

    const sessionUser: NextAuthUser = {
      id: user._id.toString(),
      publicKey: wallet.address,
    };
    return sessionUser;
  }
}
