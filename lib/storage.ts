import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import { uiText } from "@/content/uiText";

export type UploadKind = "image" | "video";

const blobNotConfiguredMessage =
  "Vercel Blob is not configured. Please add BLOB_READ_WRITE_TOKEN in Vercel Environment Variables.";

const uploadConfig = {
  image: {
    directory: path.join(process.cwd(), "public", "uploads", "images"),
    publicPath: "/uploads/images",
    blobDirectory: "uploads/images",
    maxMb: Number(process.env.MAX_IMAGE_UPLOAD_MB ?? 20),
    extensions: [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"],
    mimePrefixes: ["image/"]
  },
  video: {
    directory: path.join(process.cwd(), "public", "uploads", "videos"),
    publicPath: "/uploads/videos",
    blobDirectory: "uploads/videos",
    maxMb: Number(process.env.MAX_VIDEO_UPLOAD_MB ?? 100),
    extensions: [".mp4", ".webm", ".mov"],
    mimePrefixes: ["video/"]
  }
} satisfies Record<
  UploadKind,
  {
    directory: string;
    publicPath: string;
    blobDirectory: string;
    maxMb: number;
    extensions: string[];
    mimePrefixes: string[];
  }
>;

function getExtension(fileName: string) {
  return path.extname(fileName).toLowerCase();
}

function shouldUseBlob() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function requiresBlob() {
  return process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
}

function createUploadName(originalName: string) {
  const extension = getExtension(originalName);
  return `${Date.now()}-${randomUUID()}${extension}`;
}

export function getUploadConstraints(kind: UploadKind) {
  const config = uploadConfig[kind];

  return {
    allowedContentTypes: config.mimePrefixes.map((prefix) => `${prefix}*`),
    maximumSizeInBytes: config.maxMb * 1024 * 1024
  };
}

export function assertBlobConfigured() {
  if (!shouldUseBlob()) {
    throw new Error(blobNotConfiguredMessage);
  }
}

function validateUpload({
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
      `${uiText.apiMessages.unsupportedFileType}：${
        extension || uiText.apiMessages.unknownFileType
      }`
    );
  }

  if (type && !config.mimePrefixes.some((prefix) => type.startsWith(prefix))) {
    throw new Error(uiText.apiMessages.mimeMismatch);
  }

  const maxBytes = config.maxMb * 1024 * 1024;

  if (size > maxBytes) {
    throw new Error(`${uiText.apiMessages.fileTooLargePrefix} ${config.maxMb}MB。`);
  }
}

async function saveUploadBytes({
  bytes,
  fileName,
  kind,
  type
}: {
  bytes: Buffer;
  fileName: string;
  kind: UploadKind;
  type?: string;
}) {
  const config = uploadConfig[kind];
  const generatedName = createUploadName(fileName);

  if (shouldUseBlob()) {
    const blob = await put(`${config.blobDirectory}/${generatedName}`, bytes, {
      access: "public",
      contentType: type,
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    return {
      url: blob.url,
      fileName: generatedName,
      size: bytes.byteLength,
      type: type ?? blob.contentType
    };
  }

  if (requiresBlob()) {
    throw new Error(blobNotConfiguredMessage);
  }

  await fs.mkdir(config.directory, { recursive: true });

  const diskPath = path.join(config.directory, generatedName);

  await fs.writeFile(diskPath, bytes);

  return {
    url: `${config.publicPath}/${generatedName}`,
    fileName: generatedName,
    size: bytes.byteLength,
    type
  };
}

export async function saveUploadBuffer({
  bytes,
  fileName,
  kind,
  type
}: {
  bytes: Buffer;
  fileName: string;
  kind: UploadKind;
  type?: string;
}) {
  validateUpload({ kind, fileName, type, size: bytes.byteLength });
  return saveUploadBytes({ bytes, fileName, kind, type });
}

export async function saveUploadFile(file: File, kind: UploadKind) {
  const bytes = Buffer.from(await file.arrayBuffer());

  return saveUploadBuffer({
    bytes,
    fileName: file.name,
    kind,
    type: file.type
  });
}
