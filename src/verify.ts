import { randomBytes, createHash } from "crypto";

function hashApiKey(apiKey: string) {
  return createHash("md5").update(apiKey).digest("hex");
}

function generateApiKey() {
  return randomBytes(16).toString("hex");
}

function verifyApiKey(apiKey: string, hash: string) {
  if (hashApiKey(apiKey) == hash) {
    return true;
  }
  return false;
}

export { hashApiKey, generateApiKey, verifyApiKey };
