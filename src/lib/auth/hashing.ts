import { randomBytes } from "node:crypto";

import { hash, verify } from "@node-rs/argon2";

/**
 * OWASP-recommended argon2id parameters (19 MiB, t=2, p=1).
 * Single source of truth, shared by the login action and by `scripts/seed.ts`.
 *
 * Deliberately not marked `server-only`: the seed script runs outside the Next
 * runtime. The module is never reachable from a Client Component anyway, since
 * @node-rs/argon2 is a native addon and cannot be bundled for the browser.
 */
const options = {
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

export function hashPassword(password: string) {
  return hash(password, options);
}

export async function verifyPassword(digest: string, password: string) {
  try {
    return await verify(digest, password, options);
  } catch {
    return false;
  }
}

let dummyDigest: Promise<string> | null = null;

/**
 * A real argon2 digest of a throwaway secret, used when the submitted email has
 * no matching row. Verifying against it costs the same as verifying a real
 * password, so login timing does not reveal which emails exist. A hand-written
 * fake string would not work: it fails to parse and returns almost instantly.
 */
export function getDummyDigest() {
  dummyDigest ??= hashPassword(randomBytes(32).toString("hex"));
  return dummyDigest;
}
