import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/server/session";
import UploadPageClient from "./UploadPageClient";
import SignOutButton from "../components/SignOutButton";

export default async function UploadPage() {
  const session = await getCurrentSession();

  if (!session?.ownerAddress) {
    redirect("/signin");
  }

  return (
    <main className="ds-shell">
      <div className="ds-panel" style={{ marginBottom: "1rem" }}>
        <p className="ds-note" style={{ marginBottom: "0.75rem" }}>
          Signed in as: <strong>{session.ownerAddress}</strong>
        </p>
        <SignOutButton />
      </div>

      <UploadPageClient sessionOwnerAddress={session.ownerAddress} />
    </main>
  );
}