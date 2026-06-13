import { GalleryExplorer } from "@/components/GalleryExplorer";
import { GalleryHeroTitle } from "@/components/GalleryHeroTitle";
import { GalleryHeroVisual } from "@/components/GalleryHeroVisual";
import { uiText } from "@/content/uiText";
import { getPublicGalleryItems } from "@/lib/public-content";

export const metadata = {
  title: uiText.gallery.metadataTitle
};

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const sortedItems = await getPublicGalleryItems();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <section className="gallery-hero-panel mb-12 overflow-hidden rounded-3xl bg-archive-paper2/70 p-7 sm:p-10">
        <div className="grid gap-9 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.9fr)] lg:items-center">
          <GalleryHeroTitle />
          <GalleryHeroVisual />
        </div>
      </section>

      <GalleryExplorer items={sortedItems} />
    </main>
  );
}
