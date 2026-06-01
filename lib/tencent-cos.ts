import { createHash, createHmac, randomUUID } from "node:crypto";
import path from "node:path";
import { uiText } from "@/content/uiText";

export type UploadKind = "image" | "video";

const uploadConfig = {
  image: {
    directory: "uploads/images",
    maxMb: Number(process.env.MAX_IMAGE_UPLOAD_MB ?? 20),
    extensions: [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"],
    mimePrefixes: ["image/"]
  },
  video: {
    directory: "uploads/videos",
    maxMb: Number(process.env.MAX_VIDEO_UPLOAD_MB ?? 300),
    extensions: [".mp4", ".webm", ".mov"],
    mimePrefixes: ["video/"]
  }
} satisfies Record<
  UploadKind,
  {
    directory: string;
    maxMb: number;
    extensions: string[];
    mimePrefixes: string[];
  }
>;

type CosConfig = {
  secretId: string;
  secretKey: string;
  bucket: string;
  region: string;
  publicUrl: string;
};

function getExtension(fileName: string) {
  return path.extname(fileName).toLowerCase();
}

function normalizePublicUrl(value: string) {
  return value.replace(/\/+$/, "");
}

export function isCosConfigured() {
  return Boolean(
    process.env.TENCENT_COS_SECRET_ID &&
      process.env.TENCENT_COS_SECRET_KEY &&
      process.env.TENCENT_COS_BUCKET &&
      process.env.TENCENT_COS_REGION &&
      process.env.TENCENT_COS_PUBLIC_URL
  );
}

export function getUploadConstraints(kind: UploadKind) {
  const config = uploadConfig[kind];

  return {
    allowedContentTypes: config.mimePrefixes.map((prefix) => `${prefix}*`),
    maximumSizeInBytes: config.maxMb * 1024 * 1024
  };
}

export function validateUpload({
  kind,
  fileName,
  type,
  size
}: {
  kind: UploadKind;
  fileName: string;
  type?: string;
  size: number;
}) {
  const config = uploadConfig[kind];
  const extension = getExtension(fileName);

  if (!config.extensions.includes(extension)) {
    throw new Error(
      `${uiText.apiMessages.unsupportedFileType}: ${
        extension || uiText.apiMessages.unknownFileType
      }`
    );
  }

  if (type && !config.mimePrefixes.some((prefix) => type.startsWith(prefix))) {
    throw new Error(uiText.apiMessages.mimeMismatch);
  }

  const maxBytes = config.maxMb * 1024 * 1024;

  if (size > maxBytes) {
    throw new Error(`${uiText.apiMessages.fileTooLargePrefix} ${config.maxMb}MB.`);
  }
}

function getCosConfig(): CosConfig {
  const {
    TENCENT_COS_SECRET_ID,
    TENCENT_COS_SECRET_KEY,
    TENCENT_COS_BUCKET,
    TENCENT_COS_REGION,
    TENCENT_COS_PUBLIC_URL
  } = process.env;

  if (
    !TENCENT_COS_SECRET_ID ||
    !TENCENT_COS_SECRET_KEY ||
    !TENCENT_COS_BUCKET ||
    !TENCENT_COS_REGION ||
    !TENCENT_COS_PUBLIC_URL
  ) {
    throw new Error("Tencent COS is not configured.");
  }

  return {
    secretId: TENCENT_COS_SECRET_ID,
    secretKey: TENCENT_COS_SECRET_KEY,
    bucket: TENCENT_COS_BUCKET,
    region: TENCENT_COS_REGION,
    publicUrl: normalizePublicUrl(TENCENT_COS_PUBLIC_URL)
  };
}

function hmacSha1(key: string | Buffer, value: string) {
  return createHmac("sha1", key).update(value).digest("hex");
}

function sha1(value: string) {
  return createHash("sha1").update(value).digest("hex");
}

function encodeCosKey(key: string) {
  return key.split("/").map(encodeURIComponent).join("/");
}

function createUploadKey(fileName: string, kind: UploadKind) {
  const extension = getExtension(fileName);
  const config = uploadConfig[kind];

  return `${config.directory}/${Date.now()}-${randomUUID()}${extension}`;
}

function createAuthorization({
  method,
  pathname,
  host,
  secretId,
  secretKey,
  expiresInSeconds = 900
}: {
  method: "put";
  pathname: string;
  host: string;
  secretId: string;
  secretKey: string;
  expiresInSeconds?: number;
}) {
  const now = Math.floor(Date.now() / 1000);
  const keyTime = `${now};${now + expiresInSeconds}`;
  const signKey = hmacSha1(secretKey, keyTime);
  const httpString = [method, pathname, "", `host=${host}`, ""].join("\n");
  const stringToSign = ["sha1", keyTime, sha1(httpString), ""].join("\n");
  const signature = hmacSha1(signKey, stringToSign);

  return [
    "q-sign-algorithm=sha1",
    `q-ak=${secretId}`,
    `q-sign-time=${keyTime}`,
    `q-key-time=${keyTime}`,
    "q-header-list=host",
    "q-url-param-list=",
    `q-signature=${signature}`
  ].join("&");
}

export function createCosUploadTarget({
  kind,
  fileName,
  type,
  size
}: {
  kind: UploadKind;
  fileName: string;
  type?: string;
  size: number;
}) {
  validateUpload({ kind, fileName, type, size });

  const cosConfig = getCosConfig();
  const key = createUploadKey(fileName, kind);
  const encodedKey = encodeCosKey(key);
  const host = `${cosConfig.bucket}.cos.${cosConfig.region}.myqcloud.com`;
  const authorization = createAuthorization({
    method: "put",
    pathname: `/${encodedKey}`,
    host,
    secretId: cosConfig.secretId,
    secretKey: cosConfig.secretKey
  });

  return {
    uploadUrl: `https://${host}/${encodedKey}`,
    url: `${cosConfig.publicUrl}/${encodedKey}`,
    key,
    authorization,
    contentType: type || "application/octet-stream"
  };
}
