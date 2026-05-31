import { randomBytes, pbkdf2Sync, timingSafeEqual } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const hashPrefix = "pbkdf2_sha256";
const iterations = 210000;
const keyLength = 32;
const digest = "sha256";

function safeEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  return (
    aBuffer.length === bBuffer.length && timingSafeEqual(aBuffer, bBuffer)
  );
}

export function hashAdminPassword(password: string) {
  const salt = randomBytes(16).toString("base64url");
  const hash = pbkdf2Sync(password, salt, iterations, keyLength, digest).toString(
    "base64url"
  );

  return `${hashPrefix}$${iterations}$${salt}$${hash}`;
}

function verifyHash(password: string, storedHash: string) {
  const [prefix, iterationText, salt, expected] = storedHash.split("$");
  const parsedIterations = Number(iterationText);

  if (
    prefix !== hashPrefix ||
    !Number.isInteger(parsedIterations) ||
    parsedIterations < 100000 ||
    !salt ||
    !expected
  ) {
    return false;
  }

  const actual = pbkdf2Sync(
    password,
    salt,
    parsedIterations,
    keyLength,
    digest
  ).toString("base64url");

  return safeEqual(actual, expected);
}

export function verifyAdminPassword(password: string) {
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;

  if (passwordHash) {
    return verifyHash(password, passwordHash);
  }

  return safeEqual(password, process.env.ADMIN_PASSWORD ?? "change-this-password");
}

function serializeEnvValue(value: string) {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function upsertEnvValue(source: string, key: string, value: string) {
  const line = `${key}=${serializeEnvValue(value)}`;
  const pattern = new RegExp(`^${key}=.*$`, "m");

  if (pattern.test(source)) {
    return source.replace(pattern, line);
  }

  return `${source.trimEnd()}\n${line}\n`;
}

function removeEnvValue(source: string, key: string) {
  return source
    .split(/\r?\n/)
    .filter((line) => !line.trimStart().startsWith(`${key}=`))
    .join("\n");
}

export async function persistAdminPasswordHash(passwordHash: string) {
  const envPath = path.join(process.cwd(), ".env");
  let source = "";

  try {
    source = await fs.readFile(envPath, "utf8");
  } catch {
    source = "";
  }

  const withoutPlainPassword = removeEnvValue(source, "ADMIN_PASSWORD");
  const nextSource = upsertEnvValue(
    withoutPlainPassword,
    "ADMIN_PASSWORD_HASH",
    passwordHash
  );

  await fs.writeFile(envPath, nextSource, "utf8");
  process.env.ADMIN_PASSWORD_HASH = passwordHash;
  delete process.env.ADMIN_PASSWORD;
}

