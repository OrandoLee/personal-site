import { okJson } from "@/lib/api-utils";
import { requireAdminApi, unauthorizedJson } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function GET() {
  const session = requireAdminApi();

  if (!session) {
    return unauthorizedJson();
  }

  return okJson({
    username: session.username,
    expiresAt: session.expiresAt
  });
}
