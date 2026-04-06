"use client";

import { useState } from "react";
import Link from "next/link";
import type { Dataset } from "@/lib/types";
import DatasetQuickActions from "../components/DatasetQuickActions";

type Props = {
  dataset: Dataset;
};

export default function MyDatasetCard({ dataset }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="ds-card">
      <div className="ds-spread">
        <div style={{ flex: 1, minWidth: "260px" }}>
          <div className="ds-row" style={{ marginBottom: "0.55rem" }}>
            <span className={`ds-badge ${dataset.isPublic ? "public" : "private"}`}>
              {dataset.isPublic ? "Public" : "Private"}
            </span>

            <span className="ds-badge info">
              {dataset.downloadCount} download{dataset.downloadCount === 1 ? "" : "s"}
            </span>
          </div>

          <h2 style={{ fontSize: "1.2rem", fontWeight: "bold", margin: "0 0 0.5rem" }}>
            {dataset.title}
          </h2>

          <p className="ds-note" style={{ margin: "0 0 0.6rem" }}>
            {dataset.description}
          </p>

          <div className="ds-kv">
            <p><strong>Chain:</strong> {dataset.chain}</p>
            <p><strong>Category:</strong> {dataset.category}</p>
            <p><strong>Version:</strong> {dataset.version}</p>
          </div>
        </div>

        <div>
          <button onClick={() => setOpen((prev) => !prev)}>
            {open ? "Hide actions" : "Show actions"}
          </button>
        </div>
      </div>

      {open && (
        <div style={{ marginTop: "1rem" }}>
          <div className="ds-actions">
            <Link className="ds-link-button" href={`/datasets/${dataset.id}`}>
              View dataset
            </Link>

            <Link className="ds-link-button" href="/manage">
              Manage
            </Link>

            <a
              className="ds-link-button"
              href={`/api/datasets/${dataset.id}/raw`}
              target="_blank"
              rel="noreferrer"
            >
              Open raw
            </a>

            <a
              className="ds-link-button"
              href={`/api/datasets/${dataset.id}/raw?download=1`}
              target="_blank"
              rel="noreferrer"
            >
              Download JSON
            </a>
          </div>

          <div style={{ marginTop: "1rem" }}>
            <DatasetQuickActions datasetId={dataset.id} />
          </div>
        </div>
      )}
    </div>
  );
}