import { OraskForm } from "@/components/OraskForm";
import { OraskMemoList } from "@/components/OraskMemoList";
import { OraskTitleLogo } from "@/components/OraskTitleLogo";
import { uiText } from "@/content/uiText";

export const metadata = {
  title: uiText.orask.metadataTitle
};

export default function OraskPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <section className="orask-page-grid grid gap-12 lg:grid-cols-[minmax(0,var(--orask-copy-width))_minmax(0,1fr)] lg:[--orask-copy-width:570px]">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <OraskTitleLogo className="mb-8" />
          <h1 className="sr-only">{uiText.orask.title}</h1>
          <OraskMemoList />
          <p className="orask-memo-description mt-7 max-w-xl text-base leading-8 text-archive-muted">
            {uiText.orask.description}
          </p>
        </div>

        <section className="orask-form-stage" aria-label={uiText.orask.formTitle}>
          <OraskForm />
        </section>
      </section>
    </main>
  );
}
