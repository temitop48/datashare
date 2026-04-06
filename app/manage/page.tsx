import { redirect } from "next/navigation";
import { getDatasetsByOwner, getOwnerDatasetStats } from "@/lib/server/manage";
import { getCurrentSession } from "@/lib/server/session";
import ManageDatasetCard from "./ManageDatasetCard";
import SignOutButton from "../components/SignOutButton";
import StatsRow from "../components/StatsRow";
import TopNav from "../components/TopNav";

type PageProps = {
  searchParams: Promise<{
    visibility?: string;
  }>;
};

export default async function ManagePage({ searchParams }: PageProps) {
  const session = await getCurrentSession();

  if (!session?.ownerAddress) {
    redirect("/signin");
  }

  const { visibility } = await searchParams;
  const safeVisibility =
    visibility === "public" || visibility === "private" ? visibility : "all";

  const [datasets, stats] = await Promise.all([
    getDatasetsByOwner(session.ownerAddress, safeVisibility),
    getOwnerDatasetStats(session.ownerAddress),
  ]);

  return (
    <main className="ds-shell">
      <TopNav
        brand="Owner Console"
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
        <h1 className="ds-title" style={{ fontSize: "2.35rem" }}>Manage My Datasets</h1>
        <p className="ds-subtitle">
          Review metadata, replace JSON content, inspect revisions, trace activity logs,
          and control visibility from one command surface.
        </p>
      </section>

      <section className="ds-panel" style={{ marginBottom: "1.5rem" }}>
        <p className="ds-note">
          <strong>Signed in wallet:</strong> {session.ownerAddress}
        </p>
        <p className="ds-note">
          You can edit or delete only datasets owned by this wallet.
        </p>

        <div className="ds-actions" style={{ marginTop: "1rem" }}>
          <SignOutButton />
        </div>
      </section>

      <StatsRow stats={stats} />

      <section className="ds-panel" style={{ marginBottom: "1.25rem" }}>
        <h2 className="ds-section-title">Filter Datasets</h2>

        <form className="ds-actions" method="GET">
          <select name="visibility" defaultValue={safeVisibility} style={{ maxWidth: "220px" }}>
            <option value="all">All datasets</option>
            <option value="public">Public only</option>
            <option value="private">Private only</option>
          </select>

          <button type="submit">Apply filter</button>
        </form>
      </section>

      <div style={{ marginBottom: "1.2rem" }}>
        <p className="ds-note">
          Showing <strong>{datasets.length}</strong> dataset{datasets.length === 1 ? "" : "s"}.
        </p>
      </div>

      {datasets.length === 0 ? (
        <div className="ds-empty">
          <p style={{ margin: 0, fontWeight: 700 }}>No datasets found for this filter.</p>
          <p className="ds-note" style={{ marginBottom: 0 }}>
            Try switching between all, public, or private datasets to surface more results.
          </p>
        </div>
      ) : (
        <div className="ds-grid">
          {datasets.map((dataset) => (
            <ManageDatasetCard key={dataset.id} dataset={dataset} />
          ))}
        </div>
      )}
    </main>
  );
}