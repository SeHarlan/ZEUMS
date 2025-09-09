import { CreateUserData } from "@/types/user";
import User from "../models/User";
import { handleServerError } from "@/utils/handleError";
import { CreateWalletData } from "@/types/wallet";
import Wallet from "../models/Wallet";
import mongoose from "mongoose";
import { User as NextAuthUser } from "next-auth";

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
  const mongooseSession = await mongoose.startSession();

  try {
    if (wallet) {
      return handleWithWallet({ wallet, createData, mongooseSession });
    }

    if (authUserId) {
      return handleWithAuthId({ authUserId, createData });
    }

    // If neither wallet nor auth ID is provided throw an error, on catch null will be returned
    throw new Error("No wallet or authUserId provided for findOrCreateUser");
  } catch (error: unknown) {
    await mongooseSession.abortTransaction();

    handleServerError({ error, location: "services-user_findOrCreateUser" });
    return null;
  } finally {
    mongooseSession.endSession();
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


  // if (createData.email) {
  //   //fetch the mongoose Model we need to add accounts
  //   const existingUserByEmail = await User.findOne({
  //     email: createData.email,
  //   })
  //     .select("_id email authUserId")
  //     .exec();

  //   if (existingUserByEmail) {
  //     if (existingUserByEmail.authUserId && existingUserByEmail.authUserId.toString() !== authUserId) {
  //       throw new Error("User already exists with this authentication id");
  //     }


  //     if (!existingUserByEmail.authUserId) {
  //       // Add the new auth Id to existing user
  //       existingUserByEmail.authUserId = new Schema.Types.ObjectId(authUserId);
  //       await existingUserByEmail.save();
  //     }

  //     const sessionUser: NextAuthUser = {
  //       id: authUserId,
  //       dbUserId: existingUserByEmail._id.toString(),
  //     };

  //     return sessionUser;
  //   }
  // } else {
  //   throw new Error("Email is required for user creation");
  // }


  // If no user exists with this email or auth id, create a new one
  
  const newUser = new User({
    ...createData,
    authUserId: authUserId,
  })
  //errors handled in parent function

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
      .lean()
      .exec();

    if (!user) {
      //shouldn't ever happen
      //just in case we need to handle case where user is not found delete the wallet
      // await walletModel.deleteOne();
      throw new Error("User not found for the given wallet");
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
      dbUserId: user._id.toString(),
    };
    return sessionUser;
  }
}
