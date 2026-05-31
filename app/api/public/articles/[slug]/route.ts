import { uiText } from "@/content/uiText";
import { errorJson, okJson } from "@/lib/api-utils";
import { getArticleBySlug } from "@/lib/articles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: {
    slug: string;
  };
};

export async function GET(_request: Request, { params }: RouteContext) {
  const article = await getArticleBySlug(params.slug);

  if (!article) {
    return errorJson(uiText.articles.notFoundOrUnpublished, 404);
  }

  return okJson(article);
}
