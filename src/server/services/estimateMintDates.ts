import { Connection, PublicKey } from "@solana/web3.js";
import { DateMap } from "@/types/asset";

class SolanaConnectionManager {
  private static instance: Connection;

  static getConnection(): Connection {
    if (!this.instance) {
      this.instance = new Connection(
        process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com",
        "confirmed"
      );
    }
    return this.instance;
  }
}

export const getMintDates = async (mintAddresses: string[]): Promise<DateMap> => {   
  const dateMap: DateMap = {};
  for (const mintAddress of mintAddresses) {
    dateMap[mintAddress] = await getMintDate(mintAddress);
  }
  return dateMap;
}

const getMintDate = async (mintAddress: string): Promise<Date | null> => { 
  // First, try to find the creation transaction signature
  const creationTxSig = await findCreationTransactionSignature(mintAddress);
  
  if (creationTxSig) {
    // Use the transaction-based method for accurate date
    const mintDate = await getMintDateFromTransaction(creationTxSig);
    if (mintDate) {
      return mintDate;
    }
  }
  
  return null
}

/**
 * Find the creation transaction signature for a mint address
 * This searches through the account's transaction history to find the creation transaction
 */
const findCreationTransactionSignature = async (mintAddress: string): Promise<string | null> => {
  try {
    const connection = SolanaConnectionManager.getConnection();

    const publicKey = new PublicKey(mintAddress);
    
    // Get the account's transaction signatures
    const signatures = await connection.getSignaturesForAddress(publicKey, {
      limit: 100, // Check last 100 transactions
    });
    
    // Look for the earliest transaction (likely the creation transaction)
    if (signatures.length > 0) {
      // Sort by slot to get the earliest transaction
      const sortedSignatures = signatures.sort((a, b) => a.slot - b.slot);
      return sortedSignatures[0].signature;
    }
    
    throw new Error("No creation transaction signatures found");
  } catch (error) {
    console.error(`Error finding creation transaction for ${mintAddress}:`, error);
    return null;
  }
}

/**
 * Get mint date from transaction details
 */
const getMintDateFromTransaction = async (transactionSignature: string): Promise<Date | null> => {
  try {
    const connection = SolanaConnectionManager.getConnection();

    const transaction = await connection.getParsedTransaction(transactionSignature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });
    
    if (transaction?.blockTime) {
      return new Date(transaction.blockTime * 1000);
    }
    
    throw new Error("No block time found");
  } catch (error) {
    console.error(`Error getting transaction details for ${transactionSignature}:`, error);
    return null;
  }
}

