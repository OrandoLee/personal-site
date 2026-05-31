import { NextResponse } from "next/server";
import type { ZodError } from "zod";
import { uiText } from "@/content/uiText";

export function okJson<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}

export function messageJson(message: string, init?: ResponseInit) {
  return NextResponse.json({ ok: true, message }, init);
}

export function errorJson(message: string, status = 400) {
  return NextResponse.json({ ok: false, message }, { status });
}

export function zodErrorMessage(error: ZodError) {
  return error.issues[0]?.message ?? uiText.apiMessages.incompleteSubmission;
}

export async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
