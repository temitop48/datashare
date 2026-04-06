"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import WalletStatus from "../components/WalletStatus";

type Props = {
  sessionOwnerAddress: string;
};

export default function UploadPageClient({ sessionOwnerAddress }: Props) {
  const { account, connected } = useWallet() as any;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [chain, setChain] = useState("base");
  const [category, setCategory] = useState("price-history");
  const [tags, setTags] = useState("token,price");
  const [version, setVersion] = useState("1.0.0");
  const [walletAddress, setWalletAddress] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [jsonText, setJsonText] = useState('{\n  "hello": "world"\n}');
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const addr = account?.address?.toString?.();
    if (connected && addr) {
      setWalletAddress(addr);
    } else {
      setWalletAddress("");
    }
  }, [connected, account]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResultUrl(null);
    setError(null);

    try {
      if (!connected || !walletAddress) {
        throw new Error("Connect your wallet first.");
      }

      if (walletAddress.toLowerCase() !== sessionOwnerAddress.toLowerCase()) {
        throw new Error("Connected wallet does not match the signed-in session.");
      }

      let parsed: unknown;

      try {
        parsed = JSON.parse(jsonText);
      } catch {
        throw new Error("Invalid JSON. Please fix the JSON format and try again.");
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          chain,
          category,
          tags: tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
          version,
          isPublic,
          data: parsed,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Upload failed");
      }

      setResultUrl(`/datasets/${data.dataset.id}`);
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const walletMatchesSession =
    connected &&
    walletAddress &&
    walletAddress.toLowerCase() === sessionOwnerAddress.toLowerCase();

  const uploadDisabled = loading || !walletMatchesSession;

  return (
    <div className="ds-shell" style={{ paddingTop: 0 }}>
      <section className="ds-hero">
        <div className="ds-brand">
          <span className="ds-brand-dot" />
          Upload Portal
        </div>
        <h1 className="ds-title" style={{ fontSize: "2.2rem" }}>Upload Dataset</h1>
        <p className="ds-subtitle">
          Publish a new dataset into DataShare with your signed-in wallet as the
          authoritative owner. This page keeps wallet and session identity aligned.
        </p>
      </section>

      <WalletStatus />

      <div className="ds-panel" style={{ marginBottom: "1rem" }}>
        <div className="ds-kv">
          <p><strong>Signed-in session:</strong> {sessionOwnerAddress}</p>
          <p><strong>Connected wallet:</strong> {walletAddress || "Not connected"}</p>
        </div>

        {!walletMatchesSession && (
          <p className="ds-error" style={{ marginTop: "0.85rem" }}>
            Connect the same wallet you used to sign in before uploading.
          </p>
        )}
      </div>

      <form className="ds-panel ds-stack" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={4}
        />

        <input
          type="text"
          placeholder="Chain"
          value={chain}
          onChange={(e) => setChain(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Tags separated by commas"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Version"
          value={version}
          onChange={(e) => setVersion(e.target.value)}
          required
        />

        <input type="text" value={sessionOwnerAddress} readOnly />

        <label className="ds-row" style={{ alignItems: "center" }}>
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            style={{ width: "auto" }}
          />
          Make this dataset public
        </label>

        <textarea
          className="ds-textarea-code"
          placeholder="Paste JSON here"
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          required
          rows={14}
        />

        <button type="submit" disabled={uploadDisabled}>
          {loading ? "Uploading..." : "Upload dataset"}
        </button>
      </form>

      {resultUrl && (
        <p className="ds-success" style={{ marginTop: "1rem" }}>
          Upload successful.{" "}
          <a href={resultUrl} style={{ textDecoration: "underline" }}>
            View your dataset →
          </a>
        </p>
      )}

      {error && (
        <p className="ds-error" style={{ marginTop: "1rem" }}>{error}</p>
      )}
    </div>
  );
}