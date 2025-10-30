import { useUser } from "@/context/UserProvider";
import { activeSolanaWalletIsInUserWallets } from "@/utils/user";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect } from "react";
import { toast } from "sonner";


export const useWalletMismatch = (withAlert: boolean = true) => { 
  const { user } = useUser();
  const { publicKey } = useWallet();

  const isWalletMismatch = user && publicKey && !activeSolanaWalletIsInUserWallets(user, publicKey);

  useEffect(() => {
    if (isWalletMismatch && withAlert) {
      toast.info("Wallet Mismatch",
        {
          description: "To login with this wallet, please log out and reconnect",
        }
      );
    } 
  }, [withAlert, isWalletMismatch]);

  return {
    isWalletMismatch,
  };
}