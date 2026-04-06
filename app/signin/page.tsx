import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/server/session";
import SignInPageClient from "./SignInPageClient";

export default async function SignInPage() {
  const session = await getCurrentSession();

  if (session?.ownerAddress) {
    redirect("/");
  }

  return <SignInPageClient />;
}