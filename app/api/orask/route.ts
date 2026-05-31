import { NextResponse } from "next/server";
import { z } from "zod";
import { uiText } from "@/content/uiText";
import { prisma } from "@/lib/db";
import { sendOraskEmail } from "@/lib/mail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const oraskSchema = z.object({
  name: z.string().trim().min(1, uiText.apiMessages.oraskNameRequired),
  email: z.string().trim().email(uiText.apiMessages.oraskEmailInvalid),
  subject: z.string().trim().min(1, uiText.apiMessages.oraskSubjectRequired),
  message: z
    .string()
    .trim()
    .min(10, uiText.apiMessages.oraskMessageTooShort)
    .max(5000, uiText.apiMessages.oraskMessageTooLong),
  sourcePage: z.string().trim().optional()
});

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: uiText.apiMessages.invalidRequestBody },
      { status: 400 }
    );
  }

  const parsed = oraskSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message: parsed.error.issues[0]?.message ?? uiText.apiMessages.checkForm
      },
      { status: 400 }
    );
  }

  const sourcePage =
    parsed.data.sourcePage || request.headers.get("referer") || uiText.admin.unknown;
  const submittedAt = new Date().toLocaleString("zh-CN", {
    timeZone: "Asia/Shanghai",
    hour12: false
  });

  try {
    await prisma.oraskMessage.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        subject: parsed.data.subject,
        message: parsed.data.message,
        source: sourcePage
      }
    });
  } catch (error) {
    console.error("Orask database error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: uiText.apiMessages.feedbackSaveFailed
      },
      { status: 500 }
    );
  }

  try {
    await sendOraskEmail({
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject,
      message: parsed.data.message,
      sourcePage,
      submittedAt
    });

    return NextResponse.json({
      ok: true,
      mailSent: true,
      message: uiText.apiMessages.feedbackSavedAndSent
    });
  } catch (error) {
    console.error("Orask mail error:", error);

    return NextResponse.json(
      {
        ok: true,
        mailSent: false,
        message: uiText.apiMessages.feedbackSavedMailFailed
      },
      { status: 202 }
    );
  }
}
