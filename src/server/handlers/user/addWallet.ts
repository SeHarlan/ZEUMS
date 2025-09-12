import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../db/mongodb";
import Wallet from "../../models/Wallet";
import { getAuthSessionUser, standardErrorResponses } from "@/utils/server";
import { SignInMessage } from "@/utils/auth";
import { ChainIdsEnum } from "@/types/wallet";
import { MongoServerError } from "mongodb";


export async function addWalletHandler(req: NextRequest): Promise<NextResponse> {
  try {
    await connectToDatabase();

    // Get the session to check authentication
    const authSessionUser = await getAuthSessionUser(req);

    // Parse the request body
    const { message, signature } = await req.json();

    if (!message || !signature) {
      throw new Error("Message and signature are required");
    }

    // Validate the signed message (similar to auth flow)
    const authUrl = process.env.NEXTAUTH_URL;
    if (!authUrl) {
      throw new Error("Server configuration error");
    }

    const signinMessage = new SignInMessage(JSON.parse(message));
    const nextAuthUrl = new URL(authUrl);

    if (signinMessage.domain !== nextAuthUrl.host) {
      throw new Error("Could not validate the domain");
    }

    const validationResult = await signinMessage.validate(signature);
    if (!validationResult) {
      throw new Error("Could not validate the signed message");
    }

    try {
      const createdWallet = new Wallet({
        address: signinMessage.publicKey,
        owner: authSessionUser.dbUserId,
        type: ChainIdsEnum.SOLANA,
      });
  
      await createdWallet.save();
  
      return NextResponse.json({createdWallet});
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        // 11000 = Duplicate key error - handle gracefully
        return NextResponse.json({ alreadyExists: true });
      }
      throw error;
    }
  } catch (error) {
    return standardErrorResponses({
      error,
      location: "handlers-addWallet",
      report: true,
    });
  }
}
