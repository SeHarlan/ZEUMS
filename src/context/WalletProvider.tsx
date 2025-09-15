"use client";

import { handleClientError } from "@/utils/handleError";
import { WalletAdapterNetwork, WalletError } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import React, { useCallback, useMemo } from "react";

const WalletContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const network = WalletAdapterNetwork.Mainnet;

  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // TODO if we need better performance, we can use a custom endpoint (use proxy to secure API key though)
  // const endpoint = `https://mainnet.helius-rpc.com/?api-key=${}`

  //if we need to customize wallets
  // const wallets = useMemo(
  //   () => [],
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   [network]
  // );

  const handleError = useCallback((error: WalletError) => {
    handleClientError({
      error,
      location: "WalletContextProvider_handleError",
    });
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} autoConnect onError={handleError}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default WalletContextProvider;
