import { PublicKey } from "@solana/web3.js";

/**
 * Basic Solana address validation (base58, 32-44 chars)
 */
export const isValidSolanaAddress = (address: string): boolean => {
  try {
    const pk = new PublicKey(address.trim());
    return pk.toBase58() === address.trim(); // checks canonical base58 encoding
  } catch {
    return false;
  }
};