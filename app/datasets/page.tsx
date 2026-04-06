import Link from "next/link";
import { getAllDatasets, searchDatasets } from "@/lib/server/datasets";
import {
  getProfilesByOwnerAddresses,
  isVerifiedCreator,
} from "@/lib/server/profiles";
import TopNav from "../components/TopNav";
import CreatorIdentity from "../components/CreatorIdentity";

type PageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function DatasetsPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const query = q?.trim() || "";

  const datasets = query
    ? await searchDatasets(query)
    : await getAllDatasets();

  const profiles = await getProfilesByOwnerAddresses(
    datasets.map((dataset) => dataset.ownerAddress)
  );

  const profileMap = new Map(
    profiles.map((profile) => [profile.ownerAddress.toLowerCase(), profile])
  );

  const creatorMeta = await Promise.all(
    datasets.map(async (dataset) => {
      const profile = profileMap.get(dataset.ownerAddress.toLowerCase());
      const verified = await isVerifiedCreator(dataset.ownerAddress);

      return {
        datasetId: dataset.id,
        profile,
        verified,
      };
    })
  );

  const creatorMetaMap = new Map(
    creatorMeta.map((item) => [item.datasetId, item])
  );

  return (
    <main className="ds-shell">
      <TopNav
        brand="Public Archive"
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
        <h1 className="ds-title" style={{ fontSize: "2.35rem" }}>
          Datasets
        </h1>
        <p className="ds-subtitle">
          Browse publicly available datasets, inspect versions, and access raw
          JSON through the DataShare archive interface.
        </p>
      </section>

      <section className="ds-panel" style={{ marginBottom: "1.5rem" }}>
        <form className="ds-actions" method="GET">
          <input
            type="text"
            name="q"
            placeholder="Search datasets..."
            defaultValue={query}
            style={{ maxWidth: "420px" }}
          />
          <button type="submit">Search</button>
        </form>
      </section>

      <p className="ds-note" style={{ marginBottom: "1.2rem" }}>
        Total results: <strong>{datasets.length}</strong>
      </p>

      {datasets.length === 0 ? (
        <div className="ds-empty">
          <p style={{ marginBottom: "0.5rem", fontWeight: 700 }}>
            No datasets found.
          </p>
          <p className="ds-note" style={{ marginBottom: 0 }}>
            Try a different search query to locate more results.
          </p>
        </div>
      ) : (
        <div className="ds-grid">
          {datasets.map((dataset) => {
            const creator = creatorMetaMap.get(dataset.id);
            const profile = creator?.profile;
            const verified = creator?.verified ?? false;

            return (
              <div key={dataset.id} className="ds-card">
                <div className="ds-row" style={{ marginBottom: "0.75rem" }}>
                  <span className="ds-badge public">Public</span>
                  <span className="ds-badge info">
                    {dataset.downloadCount} download
                    {dataset.downloadCount === 1 ? "" : "s"}
                  </span>
                </div>

                <h2
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: "bold",
                    margin: "0 0 0.6rem",
                  }}
                >
                  <Link href={`/datasets/${dataset.id}`}>{dataset.title}</Link>
                </h2>

                <p className="ds-note" style={{ margin: "0 0 0.9rem" }}>
                  {dataset.description}
                </p>

                <div style={{ marginBottom: "0.95rem" }}>
                  <p className="ds-note" style={{ marginBottom: "0.45rem" }}>
                    Created by
                  </p>
                  <CreatorIdentity
                    ownerAddress={dataset.ownerAddress}
                    displayName={profile?.displayName}
                    avatarUrl={profile?.avatarUrl}
                    isVerified={verified}
                    compact
                  />
                </div>

                <div className="ds-kv">
                  <p>
                    <strong>Chain:</strong> {dataset.chain}
                  </p>
                  <p>
                    <strong>Category:</strong> {dataset.category}
                  </p>
                  <p>
                    <strong>Tags:</strong> {dataset.tags}
                  </p>
                  <p>
                    <strong>Version:</strong> {dataset.version}
                  </p>
                </div>

                <div className="ds-actions" style={{ marginTop: "1rem" }}>
                  <Link
                    className="ds-link-button"
                    href={`/datasets/${dataset.id}`}
                  >
                    View dataset
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}