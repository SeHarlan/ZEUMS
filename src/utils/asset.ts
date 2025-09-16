import { PublicKey, Keypair } from "@solana/web3.js";

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

/**
 * Generates a valid random Solana address
 * Creates a new keypair and returns the public key as a base58 string
 */
export const generateRandomSolanaAddress = (): string => {
  const keypair = Keypair.generate();
  return keypair.publicKey.toBase58();
};