"use client";

import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { Network } from "@aptos-labs/ts-sdk";
import type { ReactNode } from "react";

export default function WalletProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AptosWalletAdapterProvider
      autoConnect={false}
      dappConfig={{
        network: Network.TESTNET,
      }}
      onError={(error) => {
        const message =
          error instanceof Error ? error.message : String(error);

        if (message.toLowerCase().includes("rejected")) {
          console.warn("Wallet request was rejected by the user.");
          return;
        }

        console.error("Wallet adapter error:", error);
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
}