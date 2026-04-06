"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import WalletStatus from "../components/WalletStatus";

type PetraSignResponse = {
  address?: string;
  application?: string;
  chainId?: number;
  fullMessage?: string;
  message?: string;
  nonce?: string;
  prefix?: string;
  signature?: {
    type?: string;
    data?: {
      data?: Record<string, number>;
    };
  };
};

function bytesToHex(bytes: number[]) {
  return "0x" + bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function SignInPageClient() {
  const router = useRouter();
  const { connected, account, signMessage } = useWallet() as any;

  const [challenge, setChallenge] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingChallenge, setLoadingChallenge] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);

  const ownerAddress = account?.address?.toString?.() ?? "";
  const publicKey =
    account?.publicKey?.toString?.() ||
    account?.publicKey ||
    "";

  async function handleGetChallenge() {
    setLoadingChallenge(true);
    setError(null);
    setMessage(null);

    try {
      if (!connected || !ownerAddress) {
        throw new Error("Connect your wallet first.");
      }

      const res = await fetch("/api/auth/challenge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ownerAddress }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to get challenge");
      }

      setChallenge(data.message);
      setMessage("Challenge created. Click 'Sign in with wallet' to continue.");
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoadingChallenge(false);
    }
  }

  async function handleWalletSignIn() {
    setLoadingVerify(true);
    setError(null);
    setMessage(null);

    try {
      if (!connected || !ownerAddress) {
        throw new Error("Connect your wallet first.");
      }

      if (!challenge) {
        throw new Error("Generate a challenge first.");
      }

      if (typeof signMessage !== "function") {
        throw new Error("Wallet signMessage is not available.");
      }

      const response = (await signMessage({
        message: challenge,
        nonce: "datashare-auth",
      })) as PetraSignResponse;

      const signedAddress = response?.address || ownerAddress;
      const signedMessage = response?.fullMessage || "";
      const byteObject = response?.signature?.data?.data;

      if (!signedMessage || !byteObject || typeof byteObject !== "object") {
        throw new Error("Wallet did not return a usable signed payload.");
      }

      const signatureHex = bytesToHex(
        Object.values(byteObject).map((v) => Number(v))
      );

      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ownerAddress,
          signedAddress,
          signedMessage,
          publicKey,
          signature: signatureHex,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Verification failed");
      }

      setMessage("Signed in successfully.");
      router.push("/");
      router.refresh();
    } catch (err: any) {
      const msg = err?.message || "Something went wrong";

      if (msg.toLowerCase().includes("rejected")) {
        setError("Signature request was rejected in Petra. Please approve it in the wallet.");
      } else {
        setError(msg);
      }
    } finally {
      setLoadingVerify(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    setChallenge("");
    setMessage("Signed out.");
    router.refresh();
  }

  return (
    <main className="ds-shell">
      <section className="ds-hero">
        <div className="ds-brand">
          <span className="ds-brand-dot" />
          Identity Gate
        </div>
        <h1 className="ds-title" style={{ fontSize: "2.35rem" }}>Sign In</h1>
        <p className="ds-subtitle">
          Connect Petra, generate a DataShare challenge, and verify your wallet
          ownership through the Shelby-linked access flow.
        </p>
      </section>

      <WalletStatus />

      <div className="ds-panel ds-stack">
        <input
          type="text"
          value={ownerAddress}
          readOnly
          placeholder="Connected wallet address will appear here"
        />

        <button onClick={handleGetChallenge} disabled={loadingChallenge || !connected}>
          {loadingChallenge ? "Generating..." : "Generate challenge"}
        </button>

        {challenge && (
          <textarea
            value={challenge}
            readOnly
            rows={8}
            className="ds-textarea-code"
          />
        )}

        <div className="ds-actions">
          <button onClick={handleWalletSignIn} disabled={loadingVerify || !connected || !challenge}>
            {loadingVerify ? "Verifying..." : "Sign in with wallet"}
          </button>

          <button onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </div>

      {message && <p className="ds-success" style={{ marginTop: "1rem" }}>{message}</p>}
      {error && <p className="ds-error" style={{ marginTop: "1rem" }}>{error}</p>}
    </main>
  );
}