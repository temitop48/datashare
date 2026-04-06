import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/server/session";
import SignOutButton from "../components/SignOutButton";
import ProfilePageClient from "./ProfilePageClient";
import TopNav from "../components/TopNav";

export default async function ProfilePage() {
  const session = await getCurrentSession();

  if (!session?.ownerAddress) {
    redirect("/signin");
  }

  return (
    <main className="ds-shell">
      <TopNav
        brand="Profile Console"
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
        <h1 className="ds-title" style={{ fontSize: "2.2rem" }}>Public Profile</h1>
        <p className="ds-subtitle">
          Choose which details people can see about you. Only the information you enter here
          will be published and shown on your public creator profile.
        </p>
      </section>

      <section className="ds-panel" style={{ marginBottom: "1rem" }}>
        <p className="ds-note" style={{ marginBottom: "0.75rem" }}>
          Signed in as: <strong>{session.ownerAddress}</strong>
        </p>
        <SignOutButton />
      </section>

      <ProfilePageClient ownerAddress={session.ownerAddress} />
    </main>
  );
}