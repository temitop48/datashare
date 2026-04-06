import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { Network } from "@aptos-labs/ts-sdk";

export async function getShelbyClient() {
  const apiKey = process.env.SHELBY_API_KEY;

  if (!apiKey) {
    throw new Error("Missing SHELBY_API_KEY in .env.local");
  }

  const { ShelbyNodeClient } = await import("@shelby-protocol/sdk/node");

  return new ShelbyNodeClient({
    network: Network.TESTNET,
    apiKey,
  });
}