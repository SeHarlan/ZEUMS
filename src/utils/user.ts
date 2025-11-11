import { DisplayNameFields, UserType } from "@/types/user";
import { ChainIdsEnum } from "@/types/wallet";
import { truncate } from "./ui-utils";
import { PublicKey } from "@solana/web3.js";
import { parseEntryDates } from "./timeline";

// Group users wallet addresses by blockchain 
export const getWalletsByChain = (
  user: UserType | null
): Record<ChainIdsEnum, string[]> => {
  if (!user?.wallets || user.wallets.length === 0) {
    //spread operator to create a shallow copy and avoid mutating the original
    return {
      [ChainIdsEnum.SOLANA]: [],
      [ChainIdsEnum.TEZOS]: [],
    };
  }

  return user.wallets.reduce<Record<ChainIdsEnum, string[]>>(
    (acc, wallet) => {
      acc[wallet.type].push(wallet.address);
      return acc;
    },
    {
      [ChainIdsEnum.SOLANA]: [],
      [ChainIdsEnum.TEZOS]: [],
    }
  );
};

export const activeSolanaWalletIsInUserWallets = (user: UserType | null, publicKey: PublicKey | null) => {
  if (!user || !publicKey) return false;

  const solanaAddresses = getWalletsByChain(user)[ChainIdsEnum.SOLANA];
  
  return solanaAddresses.includes(publicKey.toString());
}

export const getDisplayName = (user: DisplayNameFields | null, noTruncation = false): string => { 
  if (!user) return "";
  if (user.displayName) return user.displayName;
  if (user.username) {
    if (!noTruncation) return truncate(user.username);
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

export const parseUserDates = (user: UserType): UserType => {
  return {
    ...user,
    ...(user.createdTimelineEntries && {
      createdTimelineEntries: parseEntryDates(user.createdTimelineEntries),
    }),
    ...(user.collectedTimelineEntries && {
      collectedTimelineEntries: parseEntryDates(user.collectedTimelineEntries),
    }),
  };
};

