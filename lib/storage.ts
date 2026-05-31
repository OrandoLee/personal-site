import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { uiText } from "@/content/uiText";

type UploadKind = "image" | "video";

const uploadConfig = {
  image: {
    directory: path.join(process.cwd(), "public", "uploads", "images"),
    publicPath: "/uploads/images",
    maxMb: Number(process.env.MAX_IMAGE_UPLOAD_MB ?? 20),
    extensions: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
    mimePrefixes: ["image/"]
  },
  video: {
    directory: path.join(process.cwd(), "public", "uploads", "videos"),
    publicPath: "/uploads/videos",
    maxMb: Number(process.env.MAX_VIDEO_UPLOAD_MB ?? 100),
    extensions: [".mp4", ".webm", ".mov"],
    mimePrefixes: ["video/"]
  }
} satisfies Record<
  UploadKind,
  {
    directory: string;
    publicPath: string;
    maxMb: number;
    extensions: string[];
    mimePrefixes: string[];
  }
>;

function getExtension(fileName: string) {
  return path.extname(fileName).toLowerCase();
}

export async function saveUploadFile(file: File, kind: UploadKind) {
  const config = uploadConfig[kind];
  const extension = getExtension(file.name);

  if (!config.extensions.includes(extension)) {
    throw new Error(
      `${uiText.apiMessages.unsupportedFileType}：${
        extension || uiText.apiMessages.unknownFileType
      }`
    );
  }

  if (!config.mimePrefixes.some((prefix) => file.type.startsWith(prefix))) {
    throw new Error(uiText.apiMessages.mimeMismatch);
  }

  const maxBytes = config.maxMb * 1024 * 1024;

  if (file.size > maxBytes) {
    throw new Error(`${uiText.apiMessages.fileTooLargePrefix} ${config.maxMb}MB。`);
  }

  await fs.mkdir(config.directory, { recursive: true });

  const fileName = `${Date.now()}-${randomUUID()}${extension}`;
  const diskPath = path.join(config.directory, fileName);
  const bytes = Buffer.from(await file.arrayBuffer());

  await fs.writeFile(diskPath, bytes);

  return {
    url: `${config.publicPath}/${fileName}`,
    fileName,
    size: file.size,
    type: file.type
  };
}
