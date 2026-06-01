import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import {
  createCosUploadTarget,
  getUploadConstraints,
  isCosConfigured,
  validateUpload,
  type UploadKind
} from "@/lib/tencent-cos";

export type { UploadKind };

const blobNotConfiguredMessage =
  "Vercel Blob is not configured. Please add BLOB_READ_WRITE_TOKEN in Vercel Environment Variables.";

const uploadConfig = {
  image: {
    directory: path.join(process.cwd(), "public", "uploads", "images"),
    publicPath: "/uploads/images",
    blobDirectory: "uploads/images"
  },
  video: {
    directory: path.join(process.cwd(), "public", "uploads", "videos"),
    publicPath: "/uploads/videos",
    blobDirectory: "uploads/videos"
  }
} satisfies Record<
  UploadKind,
  {
    directory: string;
    publicPath: string;
    blobDirectory: string;
  }
>;

function getExtension(fileName: string) {
  return path.extname(fileName).toLowerCase();
}

function shouldUseBlob() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function requiresRemoteStorage() {
  return process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
}

function createUploadName(originalName: string) {
  const extension = getExtension(originalName);
  return `${Date.now()}-${randomUUID()}${extension}`;
}

export { getUploadConstraints };

export function assertBlobConfigured() {
  if (!shouldUseBlob() && !isCosConfigured()) {
    throw new Error(blobNotConfiguredMessage);
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

  if (isCosConfigured()) {
    const target = createCosUploadTarget({
      kind,
      fileName,
      type,
      size: bytes.byteLength
    });
    const response = await fetch(target.uploadUrl, {
      method: "PUT",
      headers: {
        Authorization: target.authorization,
        "Content-Type": target.contentType
      },
      body: new Uint8Array(bytes)
    });

    if (!response.ok) {
      throw new Error(`Tencent COS upload failed: ${response.status}`);
    }

    return {
      url: target.url,
      fileName: target.key,
      size: bytes.byteLength,
      type
    };
  }

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

  if (requiresRemoteStorage()) {
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
