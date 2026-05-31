import { NextResponse } from "next/server";
import { uiText } from "@/content/uiText";
import { loginSchema } from "@/lib/admin-schemas";
import { createAdminSessionToken, setAdminCookie } from "@/lib/admin-auth";
import { verifyAdminPassword } from "@/lib/admin-password";
import { errorJson, readJson, zodErrorMessage } from "@/lib/api-utils";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await readJson(request));

  if (!parsed.success) {
    return errorJson(zodErrorMessage(parsed.error), 400);
  }

  const expectedUsername = process.env.ADMIN_USERNAME ?? "admin";

  if (
    parsed.data.username !== expectedUsername ||
    !verifyAdminPassword(parsed.data.password)
  ) {
    return errorJson(uiText.apiMessages.invalidCredentials, 401);
  }

  const response = NextResponse.json({
    ok: true,
    data: {
      username: parsed.data.username
    }
  });

  setAdminCookie(response, createAdminSessionToken(parsed.data.username));

  return response;
}
