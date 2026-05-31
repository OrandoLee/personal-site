import { uiText } from "@/content/uiText";
import { passwordChangeSchema } from "@/lib/admin-schemas";
import { requireAdminApi, unauthorizedJson } from "@/lib/admin-auth";
import {
  errorJson,
  okJson,
  readJson,
  zodErrorMessage
} from "@/lib/api-utils";
import {
  hashAdminPassword,
  persistAdminPasswordHash,
  verifyAdminPassword
} from "@/lib/admin-password";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  const session = requireAdminApi();

  if (!session) {
    return unauthorizedJson();
  }

  const parsed = passwordChangeSchema.safeParse(await readJson(request));

  if (!parsed.success) {
    return errorJson(zodErrorMessage(parsed.error), 400);
  }

  if (!verifyAdminPassword(parsed.data.currentPassword)) {
    return errorJson(uiText.apiMessages.currentPasswordIncorrect, 401);
  }

  const passwordHash = hashAdminPassword(parsed.data.newPassword);
  await persistAdminPasswordHash(passwordHash);

  return okJson({ username: session.username });
}
