import Link from "next/link";
import { getCurrentSession } from "@/lib/server/session";
import SignOutButton from "./components/SignOutButton";
import TopNav from "./components/TopNav";

export default async function HomePage() {
  const session = await getCurrentSession();

  return (
    <main className="ds-shell">
      <TopNav
        brand="DataShare Network"
        items={[
          { href: "/profile", label: "My Profile" },
          { href: "/", label: "Home" },
          { href: "/datasets", label: "Datasets" },
          { href: "/upload", label: "Upload" },
          { href: "/manage", label: "Manage" },
          { href: "/my-datasets", label: "My Datasets" },
          { href: "/signin", label: session?.ownerAddress ? "Switch Wallet" : "Sign In" },
        ]}
      />

      <section className="ds-hero">
        <div className="ds-brandline" style={{ marginBottom: "0.75rem" }}>
          <span className="ds-brand-dot" />
          Project Info
        </div>

        <h1 className="ds-title">DataShare</h1>
        <p className="ds-project-kicker">Decentralized Dataset Library for Developers</p>

        <div className="ds-info-block">
          <p className="ds-tagline">“Upload once. Share forever. Build without limits.”</p>
          <p className="ds-subtitle">
            A platform where blockchain datasets are not hidden, duplicated, or lost,
            but stored, discovered, and used instantly.
          </p>
        </div>
      </section>

      <section className="ds-grid-2">
        <div className="ds-panel">
          <h2 className="ds-section-title">Navigation</h2>
          <div className="ds-actions">
            <Link className="ds-link-button" href="/datasets">Browse datasets</Link>
            <Link className="ds-link-button" href="/upload">Upload dataset</Link>
            <Link className="ds-link-button" href="/manage">Management dashboard</Link>
            <Link className="ds-link-button" href="/my-datasets">Owner overview</Link>
            <Link className="ds-link-button" href="/profile">Edit public profile</Link>
          </div>
        </div>

        <div className="ds-panel">
          <h2 className="ds-section-title">Session</h2>

          {session?.ownerAddress ? (
            <div className="ds-stack">
              <p className="ds-note">
                Signed in as <strong>{session.ownerAddress}</strong>
              </p>

              <div className="ds-actions">
                <Link className="ds-link-button" href="/manage">Go to dashboard</Link>
                <Link className="ds-link-button" href="/upload">Upload new dataset</Link>
                <SignOutButton />
              </div>
            </div>
          ) : (
            <div className="ds-stack">
              <p className="ds-note">You are not signed in.</p>
              <div className="ds-actions">
                <Link className="ds-link-button" href="/signin">Sign in with wallet</Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}