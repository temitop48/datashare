import { getDatasetsByOwner, getOwnerDatasetStats } from "@/lib/server/manage";
import { getCurrentSession } from "@/lib/server/session";
import SignOutButton from "../components/SignOutButton";
import StatsRow from "../components/StatsRow";
import MyDatasetCard from "./MyDatasetCard";
import TopNav from "../components/TopNav";


export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{
    owner?: string;
    visibility?: string;
  }>;
};

const sectionStyle: React.CSSProperties = {
  border: "1px solid rgba(130, 160, 220, 0.16)",
  borderRadius: "18px",
  padding: "1rem",
  marginBottom: "1.5rem",
  background: "linear-gradient(180deg, rgba(14, 24, 42, 0.9), rgba(11, 20, 38, 0.95))",
};


export default async function MyDatasetsPage({ searchParams }: PageProps) {
  const session = await getCurrentSession();
  const { owner, visibility } = await searchParams;

  const ownerAddress =
    owner?.trim() ||
    session?.ownerAddress ||
    "";

  const safeVisibility =
    visibility === "public" || visibility === "private" ? visibility : "all";

  const [datasets, stats] = ownerAddress
    ? await Promise.all([
        getDatasetsByOwner(ownerAddress, safeVisibility),
        getOwnerDatasetStats(ownerAddress),
      ])
    : [[], null];

  return (
    <main className="ds-shell">
      <TopNav
        brand="Owner Atlas"
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
        <h1 className="ds-title" style={{ fontSize: "2.35rem" }}>My Datasets</h1>
        <p className="ds-subtitle">
          View datasets owned by a wallet address, inspect visibility status,
          and jump into raw access or management controls from a cleaner overview page.
        </p>
      </section>

      {session?.ownerAddress && (
        <div style={sectionStyle}>
          <p style={{ marginBottom: "0.5rem" }}>
            <strong>Signed in as:</strong> {session.ownerAddress}
          </p>
          <p className="ds-note" style={{ marginBottom: "1rem" }}>
            You can inspect owned datasets here and move into the management dashboard when needed.
          </p>
          <SignOutButton />
        </div>
      )}

      <div style={sectionStyle}>
        <h2 className="ds-section-title">Find Owned Datasets</h2>

        <form className="ds-actions" method="GET">
          <input
            type="text"
            name="owner"
            placeholder="Enter wallet address..."
            defaultValue={ownerAddress}
            style={{ maxWidth: "420px" }}
          />

          <select
            name="visibility"
            defaultValue={safeVisibility}
            style={{ maxWidth: "220px" }}
          >
            <option value="all">All datasets</option>
            <option value="public">Public only</option>
            <option value="private">Private only</option>
          </select>

          <button type="submit">Load datasets</button>
        </form>
      </div>

      {!ownerAddress ? (
        <div className="ds-empty">
          <p style={{ marginBottom: "0.5rem", fontWeight: 700 }}>
            No wallet selected yet.
          </p>
          <p className="ds-note" style={{ marginBottom: 0 }}>
            Sign in or enter a wallet address above to view datasets owned by that wallet.
          </p>
        </div>
      ) : (
        <>
          {stats && <StatsRow stats={stats} />}

          <div style={{ marginBottom: "1.25rem" }}>
            <p className="ds-note">
              Showing <strong>{datasets.length}</strong> dataset{datasets.length === 1 ? "" : "s"}.
            </p>
          </div>

          {datasets.length === 0 ? (
            <div className="ds-empty">
              <p style={{ marginBottom: "0.5rem", fontWeight: 700 }}>
                No datasets found for this owner and filter.
              </p>
              <p className="ds-note" style={{ marginBottom: 0 }}>
                Try changing the visibility filter or loading a different owner address.
              </p>
            </div>
          ) : (
            <div className="ds-grid">
              {datasets.map((dataset) => (
                <MyDatasetCard key={dataset.id} dataset={dataset} />
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}