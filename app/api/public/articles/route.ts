import { okJson } from "@/lib/api-utils";
import { getAllArticles } from "@/lib/articles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return okJson(await getAllArticles());
}
