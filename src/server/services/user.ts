import { CreateUserData } from "@/types/user";
import User from "../models/User";
import { handleServerError } from "@/utils/handleError";
import { CreateWalletData } from "@/types/wallet";
import Wallet from "../models/Wallet";
import mongoose from "mongoose";
import { User as NextAuthUser } from "next-auth";
import PendingEmailVerification from "../models/PendingEmailVerification";

export type FindOrCreateProps = {
  createData: CreateUserData;
  authUserId?: string; // NextAuth user ID
  wallet?: CreateWalletData;
};
/**
 * @param createData - The data to create a user if not found
 * @param wallet - The wallet to find or create a user for
 * @param userAuthId - The auth user id to find or create a db user for
 * @returns the auth user id and standard user id;
 */
export async function findOrCreateUser({
  authUserId,
  wallet,
  createData
}: FindOrCreateProps): Promise<NextAuthUser | null> {
  
  try {
    if (wallet) {
      return await handleWithWallet({ wallet, createData });
    }

    if (authUserId) {
      return await handleWithAuthId({ authUserId, createData });
    }

    // If neither wallet nor auth ID is provided throw an error, on catch null will be returned
    throw new Error("No wallet or authUserId provided for findOrCreateUser");
  } catch (error: unknown) {

    const method = !!wallet ? "handleWithWallet" : "handleWithAuthId";
    handleServerError({
      error,
      location: `services-user_findOrCreateUser_${method}`
    });
    return null;
  }
}

interface HandleWithAuthIdProps {
  createData: CreateUserData;
  authUserId?: string;
}

const handleWithAuthId = async ({
  createData,
  authUserId,
}: HandleWithAuthIdProps) => {
  if (!authUserId) {
    throw new Error("authUserId not provided for handleWithAuthId Auth");
  }
  //first check if the authId is already linked to a user (most likely case)
  const existingUserByAuthId = await User.findOne({
    authUserId: authUserId,
  })
    .select("_id")
    .lean()
    .exec();

  if (existingUserByAuthId) {
    const sessionUser: NextAuthUser = {
      id: authUserId,
      dbUserId: existingUserByAuthId._id.toString(),
    };
    return sessionUser;
  }

  // find pending auth verifications, if found, add this authId to that account and return the session user
  const pendingAuthVerification = await PendingEmailVerification.findOne({
    email: createData.email,
  }).exec();

  if (pendingAuthVerification) {
    // Check if expired
    if (pendingAuthVerification.expiresAt < new Date()) {
      // Clean up expired verification (fallback in case mongodb doesn't auto delete)
      await PendingEmailVerification.deleteOne({
        _id: pendingAuthVerification._id,
      }).exec();

      throw new Error("Pending auth verification has expired");
    }

    // Find the user for this pending verification
    const existingUserByPendingId = await User.findByIdAndUpdate(
      pendingAuthVerification.userId,
      { authUserId: authUserId },
      {
        new: true,
        // Only update if authUserId doesn't exist
        conditions: { authUserId: { $exists: false } },
      }
    ).exec();

    if (!existingUserByPendingId) {
      throw new Error("No user found for the given pending auth verification");
    }

    const sessionUser: NextAuthUser = {
      id: authUserId,
      dbUserId: existingUserByPendingId._id.toString(),
    };

    return sessionUser;
  }

  // No pending verification and no existing user - create new user
  const newUser = new User({
    ...createData,
    authUserId: authUserId,
  });
  await newUser.save();

  const sessionUser: NextAuthUser = {
    id: authUserId,
    dbUserId: newUser._id.toString(),
  };
  return sessionUser;
}
interface HandleWithWalletProps {
  wallet: CreateWalletData;
  createData: CreateUserData;
}
const handleWithWallet = async ({
  wallet,
  createData,
}: HandleWithWalletProps) => {
  const mongooseSession = await mongoose.startSession();

  try {
    const walletModel = await Wallet.findOne({ address: wallet.address });
  
    if (walletModel) {
      const user = await User.findById(walletModel?.owner)
        .select("_id")
        .lean()
        .exec();
  
      if (!user) {
        //shouldn't happen
        //edge case where user is not means there is an orphan wallet
        //Log and delete the wallet

        await walletModel.deleteOne();
        throw new Error("Orphaned Wallet - User not found for the given Wallet");
      }
  
      const sessionUser: NextAuthUser = {
        id: user._id.toString(),
        dbUserId: user._id.toString(),
      };
  
      return sessionUser;
    } else {
      // If wallet does not exist, create a new user and wallet within a transaction
      
      mongooseSession.startTransaction();
  
      const user = new User(createData);
      await user.save({ session: mongooseSession });
  
      await Wallet.create(
        [{
          owner: user._id,
          address: wallet.address,
          type: wallet.type,
        }],
        { session: mongooseSession }
      ) //errors handled in parent function
  
      await mongooseSession.commitTransaction();
  
      const sessionUser: NextAuthUser = {
        id: user._id.toString(),
        dbUserId: user._id.toString(),
      };
      return sessionUser;
    }
  } catch (error: unknown) {
    if (mongooseSession.inTransaction()) {
      await mongooseSession.abortTransaction();
    }
    
    throw error; //throw error for parent function to handle
  } finally {
    mongooseSession.endSession();
  }
}
