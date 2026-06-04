import { OraskForm } from "@/components/OraskForm";
import { uiText } from "@/content/uiText";

export const metadata = {
  title: uiText.orask.metadataTitle
};

export default function OraskPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <section className="grid gap-10 lg:grid-cols-[minmax(0,var(--orask-copy-width))_minmax(0,1fr)] lg:[--orask-copy-width:560px]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div
            className="orask-title-logo mb-8 text-archive-muted"
            role="img"
            aria-label={uiText.orask.eyebrow}
          >
            <span className="orask-title-logo__main" aria-hidden="true" />
            <span className="orask-title-logo__tagline" aria-hidden="true" />
          </div>
          <h1 className="mt-4 max-w-[468px] font-serif text-[2.35rem] font-semibold leading-[1.14] text-archive-ink sm:text-7xl sm:leading-tight">
            {uiText.orask.title}
          </h1>
          <p className="mt-7 max-w-xl text-base leading-8 text-archive-muted">
            {uiText.orask.description}
          </p>
        </div>

        <section className="rounded-3xl border border-archive-line bg-archive-paper2 p-5 shadow-archive sm:p-8">
          <div className="mb-8 pb-6">
            <h2
              className="text-[38px] font-semibold leading-tight text-archive-ink"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              {uiText.orask.formTitle}
            </h2>
            <p className="mt-3 text-sm leading-7 text-archive-muted">
              {uiText.orask.formDescription}
            </p>
          </div>
          <OraskForm />
        </section>
      </section>
    </main>
  );
}
