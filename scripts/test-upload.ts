import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import fs from "fs/promises";
import path from "path";
import {
  Account,
  Aptos,
  AptosConfig,
  Ed25519PrivateKey,
  Network,
} from "@aptos-labs/ts-sdk";
import { getShelbyClient } from "../lib/shelby";

console.log("Script started...");

async function main() {
  const privateKey = process.env.APTOS_PRIVATE_KEY;
  const apiKey = process.env.SHELBY_API_KEY;

  console.log("SHELBY_API_KEY exists:", !!apiKey);
  console.log("APTOS_PRIVATE_KEY exists:", !!privateKey);

  if (!privateKey) {
    throw new Error("Missing APTOS_PRIVATE_KEY in .env.local");
  }

  if (!apiKey) {
    throw new Error("Missing SHELBY_API_KEY in .env.local");
  }

  const signer = Account.fromPrivateKey({
    privateKey: new Ed25519PrivateKey(privateKey),
  });

  console.log("Uploader address:", signer.accountAddress.toString());

  // Create Aptos client for balance check
  const aptos = new Aptos(
    new AptosConfig({
      network: Network.TESTNET,
    })
  );

  // Check APT balance before upload
  const aptBalance = await aptos.getAccountAPTAmount({
    accountAddress: signer.accountAddress,
  });

  console.log("APT balance:", aptBalance.toString());

  if (aptBalance <= 0) {
    throw new Error(
      "Wallet has no APT for gas. Fund the wallet with Aptos testnet APT, then run again."
    );
  }

  const shelbyClient = await getShelbyClient();

  const filePath = path.join(process.cwd(), "data", "sample-dataset.json");
  console.log("Reading file:", filePath);

  const blobData = await fs.readFile(filePath);
  console.log("File size:", blobData.length, "bytes");

  if (blobData.length === 0) {
    throw new Error("sample-dataset.json is empty");
  }

  const datasetId = "ds_demo_001";
  const blobName = `datasets/base/token-price-history/${datasetId}/data.json`;
  const expirationMicros = (Date.now() + 1000 * 60 * 60 * 24 * 30) * 1000;

  console.log("Uploading to Shelby...");
  console.log("Blob name:", blobName);

  const result = await shelbyClient.upload({
    signer,
    blobData,
    blobName,
    expirationMicros,
  });

  console.log("Upload complete.");
  console.log(result);
}

main().catch((error) => {
  console.error("Upload failed:");
  console.error(error);
  process.exit(1);
});