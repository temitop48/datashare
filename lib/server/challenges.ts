type ChallengeEntry = {
  message: string;
  createdAt: number;
};

const challengeStore = new Map<string, ChallengeEntry>();
const MAX_CHALLENGE_AGE_MS = 10 * 60 * 1000;

export function createChallenge(ownerAddress: string) {
  const nonce = crypto.randomUUID();

  const message = [
    "Sign this message to authenticate with DataShare.",
    `Wallet: ${ownerAddress}`,
    `Nonce: ${nonce}`,
    `Issued At: ${new Date().toISOString()}`,
  ].join("\n");

  challengeStore.set(ownerAddress.toLowerCase(), {
    message,
    createdAt: Date.now(),
  });

  return message;
}

export function getChallenge(ownerAddress: string) {
  const entry = challengeStore.get(ownerAddress.toLowerCase());

  if (!entry) return null;

  const expired = Date.now() - entry.createdAt > MAX_CHALLENGE_AGE_MS;

  if (expired) {
    challengeStore.delete(ownerAddress.toLowerCase());
    return null;
  }

  return entry;
}

export function deleteChallenge(ownerAddress: string) {
  challengeStore.delete(ownerAddress.toLowerCase());
}