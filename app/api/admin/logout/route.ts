import { NextResponse } from "next/server";
import { uiText } from "@/content/uiText";
import { clearAdminCookie } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST() {
  const response = NextResponse.json({
    ok: true,
    message: uiText.apiMessages.loggedOut
  });

  clearAdminCookie(response);

  return response;
}
