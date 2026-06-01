import type { ApiResult } from "@/components/admin/types";

type UploadKind = "image" | "video";

type CosUploadTarget = {
  uploadUrl: string;
  url: string;
  authorization: string;
  contentType: string;
};

export async function uploadToCos({
  file,
  kind,
  onProgress
}: {
  file: File;
  kind: UploadKind;
  onProgress?: (percentage: number) => void;
}) {
  const targetResponse = await fetch("/api/admin/upload/cos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      kind,
      fileName: file.name,
      type: file.type,
      size: file.size
    })
  });
  const targetResult = (await targetResponse.json()) as ApiResult<CosUploadTarget>;

  if (!targetResponse.ok || !targetResult.ok || !targetResult.data) {
    throw new Error(targetResult.message ?? "Upload signature failed.");
  }

  await putFile(targetResult.data, file, onProgress);
  return targetResult.data.url;
}

function putFile(
  target: CosUploadTarget,
  file: File,
  onProgress?: (percentage: number) => void
) {
  return new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();

    request.open("PUT", target.uploadUrl);
    request.setRequestHeader("Authorization", target.authorization);
    request.setRequestHeader("Content-Type", target.contentType);
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress?.(Math.round((event.loaded / event.total) * 100));
      }
    };
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        onProgress?.(100);
        resolve();
        return;
      }

      reject(new Error(`Tencent COS upload failed: ${request.status}`));
    };
    request.onerror = () => reject(new Error("Tencent COS upload failed."));
    request.send(file);
  });
}
