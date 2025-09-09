import { DisplayNameFields, UserType } from "@/types/user";
import { ChainIdsEnum } from "@/types/wallet";
import { truncate } from "./ui-utils";
import { PublicKey } from "@solana/web3.js";


const defaultWallets: Record<ChainIdsEnum, string[]> = {
  [ChainIdsEnum.SOLANA]: [],
  [ChainIdsEnum.TEZOS]: [],
};

// Group users wallet addresses by blockchain 
export const getWalletsByChain = (user: UserType | null) => { 
  if (!user?.wallets || user.wallets.length === 0) {
    //spread operator to create a shallow copy and avoid mutating the original
    return defaultWallets;
  }
  
  return user.wallets.reduce(
    (acc, wallet) => {
      acc[wallet.type].push(wallet.address);
      return acc;
    },
    defaultWallets
  );
}

export const activeSolanaWalletIsInUserWallets = (user: UserType | null, publicKey: PublicKey | null) => {
  if (!user || !publicKey) return false;

  const solanaAddresses = getWalletsByChain(user)[ChainIdsEnum.SOLANA];
  
  return solanaAddresses.includes(publicKey.toString());
}

export const getDisplayName = (user: DisplayNameFields | null, useTruncation?: boolean): string => { 
  if (!user) return "";
  if (user.displayName) return user.displayName;
  if (user.username) {
    if (useTruncation) return truncate(user.username);
    return user.username;
  }
  return "";
}

export const getPrimaryWallet = (user: UserType | null) => { 
  if (!user?.wallets || user.wallets.length === 0) return null;

  // Assuming the first wallet is the primary one for now
  const primaryWallet = user.wallets[0];
  
  return {
    type: primaryWallet.type,
    address: primaryWallet.address,
  };
}
