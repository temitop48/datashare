"use client";

import Link from "next/link";
import { useState } from "react";

type Props = {
  datasetId: string;
};

export default function DatasetQuickActions({ datasetId }: Props) {
  const [message, setMessage] = useState<string | null>(null);

  async function copyText(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setMessage(`${label} copied.`);
      setTimeout(() => setMessage(null), 2000);
    } catch {
      setMessage(`Failed to copy ${label.toLowerCase()}.`);
      setTimeout(() => setMessage(null), 2000);
    }
  }

  const datasetUrl = `/datasets/${datasetId}`;
  const rawUrl = `/api/datasets/${datasetId}/raw`;
  const downloadUrl = `/api/datasets/${datasetId}/raw?download=1`;

  return (
    <div className="ds-stack">
      <div className="ds-actions">
        <Link className="ds-link-button" href={datasetUrl}>View page</Link>
        <a className="ds-link-button" href={rawUrl} target="_blank" rel="noreferrer">
          Open raw
        </a>
        <a className="ds-link-button" href={downloadUrl} target="_blank" rel="noreferrer">
          Download JSON
        </a>
        <button type="button" onClick={() => copyText(datasetUrl, "Dataset link")}>
          Copy dataset link
        </button>
        <button type="button" onClick={() => copyText(rawUrl, "Raw link")}>
          Copy raw link
        </button>
      </div>

      {message && <p className="ds-success">{message}</p>}
    </div>
  );
}