import Link from "next/link";

type InfoPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  items: Array<{ title: string; text: string }>;
};

export function InfoPage({ eyebrow, title, intro, items }: InfoPageProps) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-4xl px-6 py-16 md:py-24">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          Back home
        </Link>
        <p className="mt-10 text-xs uppercase tracking-[0.25em] text-muted-foreground">{eyebrow}</p>
        <h1 className="mt-4 text-5xl font-bold md:text-7xl">{title}</h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">{intro}</p>
        <div className="mt-12 grid gap-4">
          {items.map((item) => (
            <article key={item.title} className="rounded-3xl border border-border bg-card p-6">
              <h2 className="text-xl font-bold">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
