import { okJson } from "@/lib/api-utils";
import { getPublicGalleryItems } from "@/lib/public-content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return okJson(await getPublicGalleryItems());
}
