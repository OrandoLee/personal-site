"use client";

import { useRef, useState } from "react";
import { uploadToCos } from "@/components/admin/uploadToCos";
import { uiText } from "@/content/uiText";

type UploadFieldProps = {
  label: string;
  kind: "image" | "video";
  value?: string;
  onChange: (url: string) => void;
  showUrlInput?: boolean;
};

export function UploadField({
  label,
  kind,
  value,
  onChange,
  showUrlInput = true
}: UploadFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  async function uploadFile(file: File) {
    setUploading(true);
    setProgress(0);
    setMessage("");

    try {
      const url = await uploadToCos({
        file,
        kind,
        onProgress: setProgress
      });

      onChange(url);
      setProgress(100);
      setMessage(uiText.admin.uploadComplete);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : uiText.admin.uploadFailed);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="grid gap-2">
      <span className="text-sm text-zinc-400">{label}</span>
      <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/20 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="rounded-full bg-white px-4 py-2 text-xs font-medium text-zinc-950 transition hover:bg-zinc-200 disabled:opacity-60"
          >
            {uploading ? uiText.admin.statusUploading : uiText.admin.selectFile}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept={
              kind === "image"
                ? "image/jpeg,image/png,image/webp,image/gif"
                : "video/mp4,video/webm,video/quicktime"
            }
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void uploadFile(file);
              }
              event.currentTarget.value = "";
            }}
          />
          {value ? (
            <button
              type="button"
              onClick={() => onChange("")}
              className="rounded-full border border-white/10 px-3 py-2 text-xs text-zinc-400 transition hover:border-white/30 hover:text-white"
            >
              {uiText.admin.clear}
            </button>
          ) : null}
        </div>

        {showUrlInput ? (
          <input
            value={value ?? ""}
            onChange={(event) => onChange(event.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-white/40"
            placeholder={
              kind === "image"
                ? "https://...public.blob.vercel-storage.com/..."
                : "https://...public.blob.vercel-storage.com/..."
            }
          />
        ) : value ? (
          <p className="truncate rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-400">
            {value}
          </p>
        ) : null}

        {uploading || progress > 0 ? (
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-white transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        ) : null}

        {message ? <p className="text-xs text-zinc-400">{message}</p> : null}
      </div>
    </div>
  );
}
