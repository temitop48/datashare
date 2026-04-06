import {
  Ed25519PublicKey,
  Ed25519Signature,
} from "@aptos-labs/ts-sdk";

type VerifyArgs = {
  ownerAddress: string;
  signedAddress: string;
  expectedMessage: string;
  signedMessage: string;
  publicKey: string;
  signature: string;
};

function normalizeHex(value: string) {
  return value.startsWith("0x") ? value : `0x${value}`;
}

function buildExpectedPetraMessage(challenge: string) {
  return `APTOS\nmessage: ${challenge}\nnonce: datashare-auth`;
}

export function verifyAptosSignature({
  ownerAddress,
  signedAddress,
  expectedMessage,
  signedMessage,
  publicKey,
  signature,
}: VerifyArgs) {
  const expectedWrappedMessage = buildExpectedPetraMessage(expectedMessage);

  if (signedMessage !== expectedWrappedMessage) {
    throw new Error("Signed message does not match the challenge");
  }

  if (signedAddress.toLowerCase() !== ownerAddress.toLowerCase()) {
    throw new Error("Signed address does not match ownerAddress");
  }

  const normalizedPublicKey = normalizeHex(publicKey);
  const normalizedSignature = normalizeHex(signature);

  const pk = new Ed25519PublicKey(normalizedPublicKey);
  const sig = new Ed25519Signature(normalizedSignature);

  const encodedMessage = new TextEncoder().encode(signedMessage);

  const isValid = pk.verifySignature({
    message: encodedMessage,
    signature: sig,
  });

  if (!isValid) {
    throw new Error("Invalid wallet signature");
  }

  return true;
}