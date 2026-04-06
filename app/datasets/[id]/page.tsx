import Link from "next/link";
import { notFound } from "next/navigation";
import { getDatasetById } from "@/lib/server/datasets";
import { getDatasetRevisions } from "@/lib/server/revisions";
import {
  getProfileByOwnerAddress,
  isVerifiedCreator,
} from "@/lib/server/profiles";
import TopNav from "../../components/TopNav";
import CreatorIdentity from "../../components/CreatorIdentity";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function DatasetDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const dataset = await getDatasetById(id);

  if (!dataset) {
    notFound();
  }

  const [revisions, profile, verified] = await Promise.all([
    getDatasetRevisions(id),
    getProfileByOwnerAddress(dataset.ownerAddress),
    isVerifiedCreator(dataset.ownerAddress),
  ]);

  return (
    <main className="ds-shell">
      <TopNav
        brand="Dataset Capsule"
        items={[
          { href: "/profile", label: "My Profile" },
          { href: "/", label: "Home" },
          { href: "/datasets", label: "Datasets" },
          { href: "/upload", label: "Upload" },
          { href: "/manage", label: "Manage" },
          { href: "/my-datasets", label: "My Datasets" },
          { href: "/signin", label: "Switch Wallet" },
        ]}
      />

      <section className="ds-hero">
        <div className="ds-row" style={{ marginBottom: "0.75rem" }}>
          <span className={`ds-badge ${dataset.isPublic ? "public" : "private"}`}>
            {dataset.isPublic ? "Public dataset" : "Private dataset"}
          </span>

          <span className="ds-badge info">
            {dataset.downloadCount} download{dataset.downloadCount === 1 ? "" : "s"}
          </span>

          <span className="ds-badge info">Creator linked</span>
        </div>

        <h1 className="ds-title" style={{ fontSize: "2.35rem" }}>
          {dataset.title}
        </h1>

        <p className="ds-subtitle" style={{ marginBottom: "1rem" }}>
          {dataset.description}
        </p>

        <div className="ds-card-soft" style={{ maxWidth: "460px" }}>
          <p className="ds-note" style={{ marginBottom: "0.55rem" }}>
            Created by
          </p>

          <CreatorIdentity
            ownerAddress={dataset.ownerAddress}
            displayName={profile?.displayName}
            avatarUrl={profile?.avatarUrl}
            isVerified={verified}
          />
        </div>
      </section>

      <section className="ds-panel" style={{ marginBottom: "1.5rem" }}>
        <div className="ds-kv">
          <p><strong>ID:</strong> {dataset.id}</p>
          <p><strong>Chain:</strong> {dataset.chain}</p>
          <p><strong>Category:</strong> {dataset.category}</p>
          <p><strong>Tags:</strong> {dataset.tags}</p>
          <p><strong>Version:</strong> {dataset.version}</p>
          <p><strong>Blob name:</strong> {dataset.blobName}</p>
          <p><strong>Checksum:</strong> {dataset.checksum}</p>
          <p><strong>Public:</strong> {dataset.isPublic ? "Yes" : "No"}</p>
          <p><strong>File size:</strong> {dataset.fileSizeBytes} bytes</p>
          <p>
            <strong>Owner profile:</strong>{" "}
            <Link href={`/profiles/${dataset.ownerAddress}`}>
              {profile?.displayName || dataset.ownerAddress}
            </Link>
          </p>
          <p><strong>Uploaded by:</strong> {dataset.uploadedByAddress ?? "Not set"}</p>
          <p><strong>Created:</strong> {new Date(dataset.createdAt).toLocaleString()}</p>
          <p><strong>Updated:</strong> {new Date(dataset.updatedAt).toLocaleString()}</p>
        </div>

        <div className="ds-actions" style={{ marginTop: "1rem" }}>
          <a
            className="ds-link-button"
            href={`/api/datasets/${dataset.id}/raw`}
            target="_blank"
            rel="noreferrer"
          >
            Open raw JSON
          </a>

          <a
            className="ds-link-button"
            href={`/api/datasets/${dataset.id}/raw?download=1`}
            target="_blank"
            rel="noreferrer"
          >
            Download JSON
          </a>

          <Link className="ds-link-button" href="/datasets">
            Back to datasets
          </Link>
        </div>
      </section>

      <section className="ds-panel" style={{ marginBottom: "1.5rem" }}>
        <h2 className="ds-section-title">Preview</h2>

        {dataset.previewJson ? (
          <pre className="ds-pretty-pre">{dataset.previewJson}</pre>
        ) : (
          <iframe
            className="ds-iframe"
            src={`/api/datasets/${dataset.id}/raw`}
          />
        )}
      </section>

      <section className="ds-panel">
        <h2 className="ds-section-title">Revision History</h2>

        {revisions.length === 0 ? (
          <p className="ds-note">No revisions found.</p>
        ) : (
          <div className="ds-grid">
            {revisions.map((revision) => (
              <div key={revision.id} className="ds-card-soft">
                <div className="ds-kv">
                  <p><strong>Revision ID:</strong> {revision.id}</p>
                  <p><strong>Version:</strong> {revision.version}</p>
                  <p><strong>Blob name:</strong> {revision.blobName}</p>
                  <p><strong>Checksum:</strong> {revision.checksum}</p>
                  <p><strong>File size:</strong> {revision.fileSizeBytes} bytes</p>
                  <p><strong>Created:</strong> {new Date(revision.createdAt).toLocaleString()}</p>
                  <p><strong>Note:</strong> {revision.note || "None"}</p>
                </div>

                <div className="ds-actions" style={{ marginTop: "0.75rem" }}>
                  <a
                    className="ds-link-button"
                    href={`/api/datasets/${dataset.id}/revisions/${revision.id}/raw`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open revision JSON
                  </a>

                  <a
                    className="ds-link-button"
                    href={`/api/datasets/${dataset.id}/revisions/${revision.id}/raw?download=1`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Download revision JSON
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}