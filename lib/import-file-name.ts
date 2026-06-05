export function titleFromUploadedFileName(fileName: string) {
  return fileName
    .replace(/\.[^.]+$/, "")
    .trim();
}

export function shouldUseUploadedFileTitle(value: FormDataEntryValue | null) {
  return value === "true" || value === "1";
}

export function shouldPublishImportedFile(value: FormDataEntryValue | null) {
  return value === "true" || value === "1";
}
