import { useCallback, useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { getCsrfToken } from "next-auth/react";
import { SignInMessage } from "@/utils/auth";
import base58 from "bs58";
import axios from "axios";
import { toast } from "sonner";
import { handleClientError } from "@/utils/handleError";
import { USER_WALLET_ROUTE } from "@/constants/serverRoutes";
import { TITLE_COPY } from "@/textCopy/mainCopy";
import { useUser } from "@/context/UserProvider";
import { WalletType } from "@/types/wallet";
import type { DeleteResult } from "mongoose";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { activeSolanaWalletIsInUserWallets } from "@/utils/user";

export const useSolanaWalletVerification = () => {
  const { publicKey, signMessage } = useWallet();
  const { user, setUser } = useUser();
  const [isVerifying, setIsVerifying] = useState(false);
  const { setVisible } = useWalletModal();
  const [intendsToVerify, setIntendsToVerify] = useState(false);

  const canVerify = !!publicKey && !!signMessage;
  const isVerified = activeSolanaWalletIsInUserWallets(user, publicKey);

  const verifiedPublicKey = isVerified ? publicKey!.toString() : null;
  
  const verifyWallet = useCallback(async () => {
    if (isVerifying) return;

    if (!canVerify) {
      setIntendsToVerify(true);
      setVisible(true);
      return;
    }

    if (isVerified) {
      toast.info("Wallet already verified");
      setIntendsToVerify(false);
      setVisible(false);
      return;
    }
 
    setIsVerifying(true);
    setIntendsToVerify(false);

    try {
      const csrf = await getCsrfToken();
      if (!csrf) {
        throw new Error("failed to get CSRF token");
      }

      const message = new SignInMessage({
        domain: window.location.host,
        publicKey: publicKey.toBase58(),
        statement: `Sign this message to verify your wallet for ${TITLE_COPY} -- `,
        nonce: csrf,
      });

      const data = new TextEncoder().encode(message.prepare());
      const signature = await signMessage(data);
      const serializedSignature = base58.encode(signature);

      const { createdWallet, alreadyExists } = await axios
        .post<{ createdWallet?: WalletType, alreadyExists?: boolean }>(
          USER_WALLET_ROUTE,
          {
            message: JSON.stringify(message),
            signature: serializedSignature,
          }
        )
        .then((response) => response.data);

      if (alreadyExists) {
        toast.info("Wallet already verified by another account");
        setIsVerifying(false);
        return;
      }
      if (createdWallet) {
        toast.success("Wallet verified successfully");

        setUser(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            wallets: [...prev.wallets, createdWallet],
          };
        });
      }
    } catch (error) {
      toast.error("Failed to verify wallet");
      handleClientError({
        error,
        location: "useWalletVerification_verifyWallet",
      });
    } finally {
      setIsVerifying(false);
    }
  }, [canVerify, isVerifying, publicKey, setUser, setVisible, signMessage, isVerified]);

  const removeWallet = useCallback(async (walletAddress: string) => {
    if (isVerifying) return;
    setIsVerifying(true);
    try {
      const {
        acknowledged,
        deletedCount
      } = await axios.delete<DeleteResult>(`${USER_WALLET_ROUTE}?walletAddress=${walletAddress}`)
        .then((response) => response.data);

      if (acknowledged && deletedCount > 0) {
        toast.success("Wallet removed successfully.");
        setUser(prevUser => {
          if (!prevUser) return prevUser;
          return {
            ...prevUser,
            wallets: prevUser.wallets.filter(wallet => wallet.address !== walletAddress),
          };
        });
      } else {
        throw new Error(`Error removing wallet`);
      }

    } catch (error) {
      handleClientError({
        error,
        location: "useWalletVerification_removeWallet",
      });
    } finally {
      setIsVerifying(false);
    }
  }, [isVerifying, setUser]);

  useEffect(() => {
    if (intendsToVerify && canVerify && !isVerified) {
      verifyWallet();
    }
  }, [intendsToVerify, canVerify, verifyWallet, isVerified]);

  return {
    verifyWallet,
    removeWallet,
    isVerifying,
    verifiedPublicKey,
  };
};
