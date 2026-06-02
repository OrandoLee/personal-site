import { okJson } from "@/lib/api-utils";
import { getPublicLabProjects } from "@/lib/public-content";
import { isLabCategoryKey } from "@/data/lab";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const category = new URL(request.url).searchParams.get("category");
  const validCategory = category && isLabCategoryKey(category) ? category : undefined;

  return okJson(await getPublicLabProjects(validCategory));
}
