import crypto from "crypto";

const JWT_SECRET =
  process.env.JWT_SECRET || "the-iphone-project-default-jwt-secret-key-32-chars-long";

export interface TokenPayload {
  email: string;
  exp: number;
}

/**
 * Creates a signed JWT session token valid for 30 days.
 */
export function createToken(payload: { email: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const exp = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // 30 days
  const claims = Buffer.from(JSON.stringify({ email: payload.email.toLowerCase(), exp })).toString(
    "base64url",
  );

  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${header}.${claims}`)
    .digest("base64url");

  return `${header}.${claims}.${signature}`;
}

/**
 * Verifies and decodes a signed JWT session token.
 * Returns the decoded payload or null if invalid/expired.
 */
export function verifyToken(token: string): { email: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [header, claims, signature] = parts;

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(`${header}.${claims}`)
      .digest("base64url");

    if (signature !== expectedSignature) {
      return null;
    }

    // Parse and check claims
    const decodedClaims = JSON.parse(
      Buffer.from(claims, "base64url").toString("utf8"),
    ) as TokenPayload;

    if (decodedClaims.exp && decodedClaims.exp < Date.now() / 1000) {
      console.warn("JWT Verification: Token expired");
      return null;
    }

    return {
      email: decodedClaims.email.toLowerCase(),
    };
  } catch (err) {
    console.error("JWT Verification error:", err);
    return null;
  }
}
