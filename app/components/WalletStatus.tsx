"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";

export default function WalletStatus() {
  const { connected, account, wallet, connect, disconnect } = useWallet() as any;

  async function handleConnect() {
    await connect("Petra");
  }

  return (
    <div className="ds-card">
      <div className="ds-row" style={{ justifyContent: "space-between" }}>
        <div className="ds-stack" style={{ minWidth: "260px", flex: 1 }}>
          <div className="ds-brand">
            <span className="ds-brand-dot" />
            Wallet Sync
          </div>

          <div className="ds-kv">
            <p><strong>Wallet:</strong> {wallet?.name ?? "Not connected"}</p>
            <p><strong>Address:</strong> {account?.address?.toString?.() ?? "Not connected"}</p>
          </div>
        </div>

        <div className="ds-actions">
          {!connected ? (
            <button onClick={handleConnect}>Connect Petra</button>
          ) : (
            <button onClick={() => disconnect?.()}>Disconnect</button>
          )}
        </div>
      </div>
    </div>
  );
}