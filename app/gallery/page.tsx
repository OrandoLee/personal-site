import { GalleryExplorer } from "@/components/GalleryExplorer";
import { SectionTitleLogo } from "@/components/SectionTitleLogo";
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
      <section className="mb-12 rounded-3xl bg-archive-paper2/70 p-7 sm:p-10">
        <div>
          <SectionTitleLogo
            ariaLabel="Image. Ideas visualized."
            className="mb-7"
            main="/section-logos/gallery-main.svg"
            mainRatio="500 / 150"
            maxWidth="420px"
            tagline="/section-logos/gallery-tagline.svg"
            taglineOffset="0.9rem"
            taglineRatio="1265 / 90"
            taglineWidth="88%"
          />
          <h1 className="mt-4 max-w-[509px] font-serif text-5xl font-semibold leading-tight text-archive-ink sm:text-7xl">
            {uiText.gallery.heroTitle}
          </h1>
        </div>
      </section>

      <GalleryExplorer items={sortedItems} />
    </main>
  );
}
