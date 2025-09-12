import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../db/mongodb";
import Wallet from "../../models/Wallet";
import { getAuthSessionUser, standardErrorResponses } from "@/utils/server";

export async function removeWalletHandler(req: NextRequest): Promise<NextResponse> {
  try {
    await connectToDatabase();

    // Get the session to check authentication
    const authSessionUser = await getAuthSessionUser(req);

    // Parse params to get wallet address
    const { searchParams } = new URL(req.url);
    const walletAddress = searchParams.get('walletAddress');
    
    if (!walletAddress) {
      throw new Error("Wallet address is required");
    }
    
    // Check if this is the user's last wallet
    const walletCount = await Wallet.countDocuments({
      owner: authSessionUser.dbUserId,
    });

    if (walletCount <= 1) {
      throw new Error("Cannot remove the last verified wallet. Users must have at least one verified wallet.");
    }

      // Delete the wallet by address and owner
    const deleteResult = await Wallet.deleteOne({
        address: walletAddress,
        owner: authSessionUser.dbUserId,
      });
 
    if (!deleteResult.acknowledged || deleteResult.deletedCount === 0) {
      throw new Error("Wallet not found or failed to delete");
    }

    return NextResponse.json(deleteResult);
  } catch (error) {
    return standardErrorResponses({
      error,
      location: "handlers-removeWallet",
      report: true,
    });
  }
}
