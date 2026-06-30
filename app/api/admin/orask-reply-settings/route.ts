import {
  oraskReplySettingsSchema
} from "@/lib/admin-schemas";
import { requireAdminApi, unauthorizedJson } from "@/lib/admin-auth";
import {
  errorJson,
  okJson,
  readJson,
  zodErrorMessage
} from "@/lib/api-utils";
import {
  getOraskReplySenderEmail,
  isReplySmtpConfigured,
  setOraskReplySenderEmail
} from "@/lib/orask-reply-settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!requireAdminApi()) {
    return unauthorizedJson();
  }

  return okJson({
    senderEmail: await getOraskReplySenderEmail(),
    smtpConfigured: isReplySmtpConfigured()
  });
}

export async function PATCH(request: Request) {
  if (!requireAdminApi()) {
    return unauthorizedJson();
  }

  const parsed = oraskReplySettingsSchema.safeParse(await readJson(request));

  if (!parsed.success) {
    return errorJson(zodErrorMessage(parsed.error), 400);
  }

  return okJson({
    senderEmail: await setOraskReplySenderEmail(parsed.data.senderEmail),
    smtpConfigured: isReplySmtpConfigured()
  });
}
