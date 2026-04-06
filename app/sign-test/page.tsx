"use client";

import { useMemo, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

function bytesToHex(bytes: number[]) {
  return "0x" + bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function SignTestPage() {
  const { connected, account, wallet, wallets = [], connect, disconnect, signMessage } =
    useWallet() as any;

  const [message, setMessage] = useState("");
  const [rawResult, setRawResult] = useState<any>(null);
  const [error, setError] = useState("");

  const publicKey =
    account?.publicKey?.toString?.() ||
    account?.publicKey ||
    "Not available from wallet account";

  const signedAddress = rawResult?.address || account?.address?.toString?.() || "";

  const signatureHex = useMemo(() => {
    const byteObject = rawResult?.signature?.data?.data;
    if (!byteObject || typeof byteObject !== "object") return "";

    const bytes = Object.values(byteObject).map((v) => Number(v));
    if (!bytes.length) return "";

    return bytesToHex(bytes);
  }, [rawResult]);

  const signedMessage = rawResult?.fullMessage || "";

  async function handleConnect() {
    try {
      setError("");
      setRawResult(null);

      if (typeof connect !== "function") {
        throw new Error(
          "Wallet adapter is not initialized. Check app/layout.tsx and app/wallet-provider.tsx."
        );
      }

      await connect("Petra");
    } catch (err: any) {
      const message =
        err?.message || String(err) || "Failed to connect wallet";

      if (message.toLowerCase().includes("rejected")) {
        setError("Connection request was rejected in Petra. Open Petra and click Approve.");
        return;
      }

      setError(message);
    }
  }

  async function handleSign() {
    try {
      setError("");
      setRawResult(null);

      if (!connected) {
        throw new Error("Connect your wallet first.");
      }

      if (typeof signMessage !== "function") {
        throw new Error("signMessage is not available from the wallet adapter.");
      }

      const response = await signMessage({
        message,
        nonce: "datashare-auth",
      });

      setRawResult(response);
    } catch (err: any) {
      const message =
        err?.message || String(err) || "Signing failed";

      if (message.toLowerCase().includes("rejected")) {
        setError("Signature request was rejected in Petra. Open Petra and approve the signing request.");
        return;
      }

      setError(message);
    }
  }

  return (
    <main style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}>
        Sign Message Test
      </h1>

      <div style={{ marginBottom: "1rem" }}>
        <p><strong>Connected:</strong> {connected ? "Yes" : "No"}</p>
        <p><strong>Wallet:</strong> {wallet?.name ?? "Not connected"}</p>
        <p><strong>Address:</strong> {account?.address?.toString?.() ?? "Not connected"}</p>
        <p><strong>Public Key:</strong> {publicKey}</p>
        <p><strong>Detected wallets:</strong> {wallets.length}</p>
      </div>

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        {!connected ? (
          <button onClick={handleConnect}>Connect Petra</button>
        ) : (
          <button onClick={() => disconnect?.()}>Disconnect</button>
        )}
      </div>

      <textarea
        placeholder="Paste challenge message here"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={8}
        style={{
          width: "100%",
          marginBottom: "1rem",
          fontFamily: "monospace",
        }}
      />

      <button onClick={handleSign} disabled={!connected}>
        Sign Message
      </button>

      {rawResult && (
        <>
          <div style={{ marginTop: "1.5rem" }}>
            <h2>Use these values in /signin</h2>

            <p><strong>Signed Address</strong></p>
            <textarea
              readOnly
              value={signedAddress}
              rows={2}
              style={{ width: "100%", marginBottom: "1rem", fontFamily: "monospace" }}
            />

            <p><strong>Signed Message</strong></p>
            <textarea
              readOnly
              value={signedMessage}
              rows={8}
              style={{ width: "100%", marginBottom: "1rem", fontFamily: "monospace" }}
            />

            <p><strong>Public Key</strong></p>
            <textarea
              readOnly
              value={String(publicKey)}
              rows={2}
              style={{ width: "100%", marginBottom: "1rem", fontFamily: "monospace" }}
            />

            <p><strong>Signature (hex)</strong></p>
            <textarea
              readOnly
              value={signatureHex}
              rows={4}
              style={{ width: "100%", marginBottom: "1rem", fontFamily: "monospace" }}
            />
          </div>

          <details style={{ marginTop: "1rem" }}>
            <summary>Raw wallet result</summary>
            <pre
              style={{
                marginTop: "1rem",
                background: "#eee",
                padding: "1rem",
                overflowX: "auto",
                whiteSpace: "pre-wrap",
              }}
            >
              {JSON.stringify(rawResult, null, 2)}
            </pre>
          </details>
        </>
      )}

      {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
    </main>
  );
}