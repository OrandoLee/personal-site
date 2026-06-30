import { prisma } from "@/lib/db";

export const oraskReplySenderEmailKey = "orask_reply_sender_email";

export async function getOraskReplySenderEmail() {
  const setting = await prisma.siteSetting.findUnique({
    where: { key: oraskReplySenderEmailKey }
  });

  return setting?.value.trim() || null;
}

export async function setOraskReplySenderEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  await prisma.siteSetting.upsert({
    where: { key: oraskReplySenderEmailKey },
    create: {
      key: oraskReplySenderEmailKey,
      value: normalizedEmail
    },
    update: {
      value: normalizedEmail
    }
  });

  return normalizedEmail;
}

export function isReplySmtpConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
  );
}
