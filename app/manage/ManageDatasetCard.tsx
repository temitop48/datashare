"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Dataset } from "@/lib/types";
import DatasetQuickActions from "../components/DatasetQuickActions";

type Revision = {
  id: string;
  version: string;
  blobName: string;
  fileSizeBytes: number;
  previewJson?: string | null;
  createdAt: string | Date;
  note?: string | null;
  checksum?: string;
};

type Props = {
  dataset: Dataset;
};

async function safeReadJson(res: Response) {
  const text = await res.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Expected JSON response but got: ${text.slice(0, 200)}`);
  }
}

const fieldLabelStyle: React.CSSProperties = {
  fontWeight: 600,
  marginBottom: "0.35rem",
  display: "block",
};

const sectionStyle: React.CSSProperties = {
  border: "1px solid rgba(130, 160, 220, 0.16)",
  borderRadius: "14px",
  padding: "1rem",
  marginTop: "1rem",
  background: "rgba(7, 16, 29, 0.68)",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.8rem",
  border: "1px solid rgba(130, 160, 220, 0.18)",
  borderRadius: "12px",
  background: "rgba(6, 13, 24, 0.82)",
  color: "#ecf3ff",
};

export default function ManageDatasetCard({ dataset }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [isOpen, setIsOpen] = useState(false);

  const [title, setTitle] = useState(dataset.title);
  const [description, setDescription] = useState(dataset.description);
  const [chain, setChain] = useState(dataset.chain);
  const [category, setCategory] = useState(dataset.category);
  const [tags, setTags] = useState(dataset.tags);
  const [version, setVersion] = useState(dataset.version);
  const [isPublic, setIsPublic] = useState(dataset.isPublic);

  const [contentText, setContentText] = useState(dataset.previewJson || "{\n  \n}");
  const [nextVersion, setNextVersion] = useState(dataset.version);

  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [showRevisions, setShowRevisions] = useState(false);
  const [loadingRevisions, setLoadingRevisions] = useState(false);

  const [activities, setActivities] = useState<any[]>([]);
  const [showActivities, setShowActivities] = useState(false);
  const [loadingActivities, setLoadingActivities] = useState(false);

  const [saving, setSaving] = useState(false);
  const [updatingContent, setUpdatingContent] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [rollingBackId, setRollingBackId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (saving || updatingContent || deleting) return;

    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch(`/api/datasets/${dataset.id}`, {
        method: "PATCH",
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
        }),
      });

      const data = await safeReadJson(res);

      if (!res.ok) {
        throw new Error((data as any)?.error || "Update failed");
      }

      setMessage("Dataset metadata updated successfully.");

      startTransition(() => {
        router.refresh();
      });
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleReplaceContent() {
    if (saving || updatingContent || deleting) return;

    setUpdatingContent(true);
    setMessage(null);
    setError(null);

    try {
      let parsed: unknown;

      try {
        parsed = JSON.parse(contentText);
      } catch {
        throw new Error("Invalid JSON. Please fix the JSON format and try again.");
      }

      const res = await fetch(`/api/datasets/${dataset.id}/content`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: parsed,
          version: nextVersion,
        }),
      });

      const data = await safeReadJson(res);

      if (!res.ok) {
        throw new Error((data as any)?.error || "Content update failed");
      }

      setMessage("Dataset JSON content replaced successfully.");
      setVersion((data as any).dataset.version);
      setNextVersion((data as any).dataset.version);
      setContentText((data as any).dataset.previewJson || contentText);

      startTransition(() => {
        router.refresh();
      });
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setUpdatingContent(false);
    }
  }

  async function handleDelete() {
    if (saving || updatingContent || deleting) return;

    const confirmed = window.confirm(
      `Delete dataset "${dataset.title}"? This removes the metadata record from DataShare.`
    );

    if (!confirmed) return;

    setDeleting(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch(`/api/datasets/${dataset.id}`, {
        method: "DELETE",
      });

      const data = await safeReadJson(res);

      if (!res.ok) {
        throw new Error((data as any)?.error || "Delete failed");
      }

      setMessage("Dataset deleted successfully.");

      startTransition(() => {
        router.refresh();
      });
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setDeleting(false);
    }
  }

  async function handleLoadRevisions() {
    setLoadingRevisions(true);
    setError(null);

    try {
      const res = await fetch(`/api/datasets/${dataset.id}/revisions`);
      const data = await safeReadJson(res);

      if (!res.ok) {
        throw new Error((data as any)?.error || "Failed to load revisions");
      }

      setRevisions((data as any).revisions || []);
      setShowRevisions(true);
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoadingRevisions(false);
    }
  }

  async function handleRollback(revisionId: string) {
    const confirmed = window.confirm(
      "Roll back this dataset to the selected revision?"
    );

    if (!confirmed) return;

    setRollingBackId(revisionId);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch(
        `/api/datasets/${dataset.id}/revisions/${revisionId}/rollback`,
        {
          method: "POST",
        }
      );

      const data = await safeReadJson(res);

      if (!res.ok) {
        throw new Error((data as any)?.error || "Rollback failed");
      }

      setMessage("Rollback completed successfully.");

      startTransition(() => {
        router.refresh();
      });
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setRollingBackId(null);
    }
  }

  async function handleLoadActivities() {
    setLoadingActivities(true);
    setError(null);

    try {
      const res = await fetch(`/api/datasets/${dataset.id}/activities`);
      const data = await safeReadJson(res);

      if (!res.ok) {
        throw new Error((data as any)?.error || "Failed to load activities");
      }

      setActivities((data as any).activities || []);
      setShowActivities(true);
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoadingActivities(false);
    }
  }

  return (
    <div className="ds-card">
      <div className="ds-spread">
        <div style={{ flex: 1, minWidth: "260px" }}>
          <div className="ds-row" style={{ marginBottom: "0.6rem" }}>
            <span className={`ds-badge ${isPublic ? "public" : "private"}`}>
              {isPublic ? "Public" : "Private"}
            </span>

            <span className="ds-badge info">
              {dataset.downloadCount} download{dataset.downloadCount === 1 ? "" : "s"}
            </span>
          </div>

          <h2 style={{ fontSize: "1.22rem", fontWeight: "bold", margin: "0 0 0.5rem" }}>
            {title}
          </h2>

          <div className="ds-meta">
            <p style={{ margin: 0 }}><strong style={{ color: "var(--text)" }}>Version:</strong> {version}</p>
            <p style={{ margin: 0 }}><strong style={{ color: "var(--text)" }}>Chain:</strong> {chain}</p>
            <p style={{ margin: 0 }}><strong style={{ color: "var(--text)" }}>Category:</strong> {category}</p>
          </div>
        </div>

        <div>
          <button onClick={() => setIsOpen((prev) => !prev)}>
            {isOpen ? "Hide details" : "Open details"}
          </button>
        </div>
      </div>

      {isOpen && (
        <>
          <div style={sectionStyle}>
            <h3 className="ds-section-title">Metadata</h3>

            <div className="ds-stack">
              <div>
                <label style={fieldLabelStyle}>Title</label>
                <input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div>
                <label style={fieldLabelStyle}>Description</label>
                <textarea
                  style={{ ...inputStyle, minHeight: "100px" }}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <label style={fieldLabelStyle}>Chain</label>
                <input style={inputStyle} value={chain} onChange={(e) => setChain(e.target.value)} />
              </div>

              <div>
                <label style={fieldLabelStyle}>Category</label>
                <input style={inputStyle} value={category} onChange={(e) => setCategory(e.target.value)} />
              </div>

              <div>
                <label style={fieldLabelStyle}>Tags</label>
                <input style={inputStyle} value={tags} onChange={(e) => setTags(e.target.value)} />
              </div>

              <div>
                <label style={fieldLabelStyle}>Version</label>
                <input style={inputStyle} value={version} onChange={(e) => setVersion(e.target.value)} />
              </div>

              <label className="ds-row" style={{ alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  style={{ width: "auto" }}
                />
                Public dataset
              </label>
            </div>
          </div>

          <div style={sectionStyle}>
            <h3 className="ds-section-title">Dataset Info</h3>
            <div className="ds-kv">
              <p><strong>ID:</strong> {dataset.id}</p>
              <p><strong>Owner:</strong> {dataset.ownerAddress}</p>
              <p><strong>Version:</strong> {dataset.version}</p>
              <p><strong>Checksum:</strong> {dataset.checksum}</p>
              <p><strong>Created:</strong> {new Date(dataset.createdAt).toLocaleString()}</p>
              <p><strong>Updated:</strong> {new Date(dataset.updatedAt).toLocaleString()}</p>
            </div>
          </div>

          <div style={sectionStyle}>
            <h3 className="ds-section-title">Actions</h3>

            <div className="ds-actions">
              <button onClick={handleSave} disabled={saving || deleting || updatingContent || isPending}>
                {saving ? "Saving..." : "Save metadata"}
              </button>

              <button onClick={handleDelete} disabled={saving || deleting || updatingContent || isPending}>
                {deleting ? "Deleting..." : "Delete dataset"}
              </button>

              <Link className="ds-link-button" href={`/datasets/${dataset.id}`}>
                {dataset.isPublic ? "View dataset page" : "View private dataset page"}
              </Link>
            </div>

            <div style={{ marginTop: "1rem" }}>
              <DatasetQuickActions datasetId={dataset.id} />
            </div>
          </div>

          <div style={sectionStyle}>
            <h3 className="ds-section-title">Replace JSON content</h3>

            <div>
              <label style={fieldLabelStyle}>Next version</label>
              <input
                style={{ ...inputStyle, marginBottom: "0.75rem" }}
                type="text"
                value={nextVersion}
                onChange={(e) => setNextVersion(e.target.value)}
                placeholder="Version after content update"
              />
            </div>

            <div>
              <label style={fieldLabelStyle}>JSON content</label>
              <textarea
                value={contentText}
                onChange={(e) => setContentText(e.target.value)}
                rows={12}
                className="ds-textarea-code"
                style={{
                  ...inputStyle,
                  marginBottom: "0.75rem",
                }}
              />
            </div>

            <button
              onClick={handleReplaceContent}
              disabled={saving || deleting || updatingContent || isPending}
            >
              {updatingContent ? "Replacing content..." : "Replace JSON content"}
            </button>
          </div>

          <div style={sectionStyle}>
            <h3 className="ds-section-title">Revision history</h3>

            <button
              onClick={handleLoadRevisions}
              disabled={loadingRevisions}
              style={{ marginBottom: "0.75rem" }}
            >
              {loadingRevisions ? "Loading revisions..." : "Load revisions"}
            </button>

            {showRevisions && (
              revisions.length === 0 ? (
                <p className="ds-note">No revisions found.</p>
              ) : (
                <div className="ds-grid">
                  {revisions.map((revision) => (
                    <div key={revision.id} className="ds-card-soft">
                      <div className="ds-kv">
                        <p><strong>Revision:</strong> {revision.id}</p>
                        <p><strong>Version:</strong> {revision.version}</p>
                        <p><strong>Checksum:</strong> {revision.checksum || "Not set"}</p>
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
                          Open revision
                        </a>

                        <a
                          className="ds-link-button"
                          href={`/api/datasets/${dataset.id}/revisions/${revision.id}/raw?download=1`}
                        >
                          Download revision
                        </a>

                        <button
                          onClick={() => handleRollback(revision.id)}
                          disabled={rollingBackId === revision.id}
                        >
                          {rollingBackId === revision.id ? "Rolling back..." : "Rollback to this revision"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>

          <div style={sectionStyle}>
            <h3 className="ds-section-title">Activity log</h3>

            <button onClick={handleLoadActivities} disabled={loadingActivities}>
              {loadingActivities ? "Loading..." : "Load activity log"}
            </button>

            {showActivities && (
              activities.length === 0 ? (
                <p className="ds-note" style={{ marginTop: "0.75rem" }}>No activity yet.</p>
              ) : (
                <div className="ds-grid" style={{ marginTop: "0.75rem" }}>
                  {activities.map((activity) => {
                    let meta: any = null;

                    try {
                      meta = activity.metadata ? JSON.parse(activity.metadata) : null;
                    } catch {}

                    return (
                      <div key={activity.id} className="ds-card-soft">
                        <p><strong>Action:</strong> {activity.action}</p>
                        <p><strong>Actor:</strong> {activity.actorAddress}</p>
                        <p><strong>Time:</strong> {new Date(activity.createdAt).toLocaleString()}</p>

                        {meta && (
                          <pre className="ds-pretty-pre" style={{ marginTop: "0.7rem", fontSize: "0.85rem" }}>
                            {JSON.stringify(meta, null, 2)}
                          </pre>
                        )}
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>

          {message && (
            <p className="ds-success" style={{ marginTop: "1rem" }}>{message}</p>
          )}

          {error && (
            <p className="ds-error" style={{ marginTop: "1rem" }}>{error}</p>
          )}
        </>
      )}
    </div>
  );
}