import { useUser } from "@/context/UserProvider";
import { activeSolanaWalletIsInUserWallets } from "@/utils/user";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";


export const useWalletMismatch = (withAlert: boolean = true) => { 
  const [isWalletMismatch, setIsWalletMismatch] = useState(false);
  const { user } = useUser();
  const { publicKey } = useWallet();

  useEffect(() => {
    if (!publicKey || !user) return;

    if (!activeSolanaWalletIsInUserWallets(user, publicKey)) {
      setIsWalletMismatch(true);
      if (withAlert) {
        toast.info("Wallet Mismatch",
          {
            description: "To login with this wallet, please log out and reconnect",
          }
        );
      }
    } else {
      setIsWalletMismatch(false);
    }
  }, [publicKey, user, withAlert]);

  return {
    isWalletMismatch,
  };
}