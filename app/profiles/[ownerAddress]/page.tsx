import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfileByOwnerAddress } from "@/lib/server/profiles";
import TopNav from "../../components/TopNav";

type PageProps = {
  params: Promise<{
    ownerAddress: string;
  }>;
};

export const dynamic ="force-dynamic";

export default async function PublicProfilePage({ params }: PageProps) {
  const { ownerAddress } = await params;
  const profile = await getProfileByOwnerAddress(ownerAddress);

  if (!profile) {
    notFound();
  }

  const skills: string[] = profile.skills
    ? profile.skills
        .split(",")
        .map((s: string) => s.trim())
        .filter((s: string) => Boolean(s))
    : [];

  return (
    <main className="ds-shell">
      <TopNav
        brand="Public Profile"
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
        <div className="ds-row" style={{ alignItems: "center", marginBottom: "1rem" }}>
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.displayName}
              style={{
                width: "76px",
                height: "76px",
                objectFit: "cover",
                borderRadius: "999px",
                border: "1px solid rgba(0, 247, 255, 0.24)",
                boxShadow: "0 0 18px rgba(0, 247, 255, 0.14)",
              }}
            />
          ) : (
            <div
              style={{
                width: "76px",
                height: "76px",
                borderRadius: "999px",
                border: "1px solid rgba(0, 247, 255, 0.24)",
                background:
                  "linear-gradient(135deg, rgba(0,247,255,0.18), rgba(255,79,216,0.18))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "1.5rem",
                color: "var(--text)",
              }}
            >
              {profile.displayName.slice(0, 1).toUpperCase()}
            </div>
          )}

          <div>
            <h1 className="ds-title" style={{ fontSize: "2.2rem", marginBottom: "0.25rem" }}>
              {profile.displayName}
            </h1>
            <p className="ds-subtitle">
              {profile.bio || "No public bio provided."}
            </p>
          </div>
        </div>
      </section>

      <section className="ds-panel">
        <div className="ds-kv">
          <p><strong>Wallet:</strong> {profile.ownerAddress}</p>
          {profile.website && <p><strong>Website:</strong> {profile.website}</p>}
          {profile.twitterHandle && <p><strong>X / Twitter:</strong> {profile.twitterHandle}</p>}
          {profile.discordHandle && <p><strong>Discord:</strong> {profile.discordHandle}</p>}
          {profile.contactEmail && <p><strong>Contact:</strong> {profile.contactEmail}</p>}
          {profile.avatarUrl && <p><strong>Avatar URL:</strong> {profile.avatarUrl}</p>}
        </div>

        {skills.length > 0 && (
          <div style={{ marginTop: "1rem" }}>
            <h2 className="ds-section-title">Skills</h2>
            <div className="ds-row">
              {skills.map((skill: string) => (
                <span key={skill} className="ds-badge info">{skill}</span>
              ))}
            </div>
          </div>
        )}

        <div className="ds-actions" style={{ marginTop: "1rem" }}>
          <Link className="ds-link-button" href="/datasets">Browse datasets</Link>
        </div>
      </section>
    </main>
  );
}