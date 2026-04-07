import { Network } from "@aptos-labs/ts-sdk";

export async function getShelbyClient() {
  const apiKey = process.env.SHELBY_API_KEY;

  if (!apiKey) {
    throw new Error("Missing SHELBY_API_KEY");
  }

  const { ShelbyNodeClient } = await import("@shelby-protocol/sdk/node");

  return new ShelbyNodeClient({
    network: Network.TESTNET,
    apiKey,
  });
}