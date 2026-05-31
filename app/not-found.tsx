import Link from "next/link";
import { uiText } from "@/content/uiText";

export default function NotFound() {
  return (
    <main className="mx-auto grid min-h-[60vh] max-w-3xl place-items-center px-4 py-20 text-center sm:px-6 lg:px-8">
      <div>
        <p className="text-sm text-archive-muted">{uiText.notFound.code}</p>
        <h1 className="mt-4 font-serif text-5xl font-semibold text-archive-ink">
          {uiText.notFound.title}
        </h1>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full border border-archive-ink bg-archive-ink px-5 py-3 text-sm text-archive-paper2 transition hover:bg-transparent hover:text-archive-ink"
        >
          {uiText.notFound.backHome}
        </Link>
      </div>
    </main>
  );
}
