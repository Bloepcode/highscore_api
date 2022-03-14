import { randomBytes, createHash, scryptSync, timingSafeEqual } from "crypto";

function hashApiKey(apiKey: string) {
  const salt = randomBytes(16).toString("hex");
  // return createHash("md5").update(apiKey).digest("hex");
  return scryptSync(apiKey, salt, 64).toString("hex");
}

function generateApiKey() {
  return randomBytes(16).toString("hex");
}

function verifyApiKey(hash: string, apiKey?: string) {
  if (!apiKey) {
    console.log("NO");
    return false;
  }
  const [salt, key] = hash.split(":");
  const hashedBuffer = scryptSync(apiKey, salt, 64);

  const keyBuffer = Buffer.from(key, "hex");
  const match = timingSafeEqual(hashedBuffer, keyBuffer);

  console.log(match);

  return match;
}

export { hashApiKey, generateApiKey, verifyApiKey };
