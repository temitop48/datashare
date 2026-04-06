import { SignJWT, jwtVerify } from "jose";

const secret = process.env.SESSION_SECRET;

if (!secret) {
  throw new Error("Missing SESSION_SECRET in .env.local");
}

const secretKey = new TextEncoder().encode(secret);

export type SessionPayload = {
  ownerAddress: string;
};

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

export async function verifySessionToken(token: string) {
  const { payload } = await jwtVerify(token, secretKey);
  return payload as unknown as SessionPayload;
}