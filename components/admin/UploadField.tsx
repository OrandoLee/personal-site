"use client";

import { useRef, useState } from "react";
import { uiText } from "@/content/uiText";

type UploadFieldProps = {
  label: string;
  kind: "image" | "video";
  value?: string;
  onChange: (url: string) => void;
};

export function UploadField({ label, kind, value, onChange }: UploadFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  function upload(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);
    setProgress(0);
    setMessage("");

    const request = new XMLHttpRequest();
    request.open("POST", `/api/admin/upload/${kind}`);

    request.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    request.onload = () => {
      setUploading(false);

      try {
        const result = JSON.parse(request.responseText) as {
          ok?: boolean;
          data?: { url?: string };
          message?: string;
        };

        if (request.status >= 200 && request.status < 300 && result.data?.url) {
          onChange(result.data.url);
          setProgress(100);
          setMessage(uiText.admin.uploadComplete);
          return;
        }

        setMessage(result.message ?? uiText.admin.uploadFailed);
      } catch {
        setMessage(uiText.admin.uploadFailed);
      }
    };

    request.onerror = () => {
      setUploading(false);
      setMessage(uiText.admin.uploadNetworkError);
    };

    request.send(formData);
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
                upload(file);
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

        <input
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-white/40"
          placeholder={kind === "image" ? "/uploads/images/..." : "/uploads/videos/..."}
        />

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
