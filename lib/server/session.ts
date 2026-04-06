import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/server/auth";

export async function getCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("datashare_session")?.value;

  if (!token) return null;

  try {
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}