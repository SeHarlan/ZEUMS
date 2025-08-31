import { DisplayNameFields, UserType } from "@/types/user";
import { ChainIdsEnum } from "@/types/wallet";
import { truncate } from "./ui-utils";

// Group users wallet addresses by blockchain 
export const getWalletsByChain = (user: UserType | null) => { 
  if (!user?.wallets || user.wallets.length === 0) {
    //spread operator to create a shallow copy and avoid mutating the original
    return { solanaPublicKeys: [], tezosPublicKeys: [] };
  }
  
  const wallets = user.wallets.reduce(
    (acc, wallet) => {
      acc[wallet.type].push(wallet.address);
      return acc;
    },
    {
      [ChainIdsEnum.SOLANA]: [],
      [ChainIdsEnum.TEZOS]: [],
    } as Record<ChainIdsEnum, string[]>
  );

  return {
    solanaPublicKeys: wallets[ChainIdsEnum.SOLANA] || [],
    tezosPublicKeys: wallets[ChainIdsEnum.TEZOS] || [],
    // ethereumPublicKeys: wallets[ChainIdsEnum.ETHEREUM] || [],
    // ordinalPublicKeys: wallets[ChainIdsEnum.ORDINAL] || [],
  };
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
