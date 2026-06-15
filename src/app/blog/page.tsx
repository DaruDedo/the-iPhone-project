import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

import { blogPosts } from "@/data/blog";
import { absoluteUrl, breadcrumbJsonLd, JsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Design notes, material science, and behind-the-scenes stories from The iPhone Project.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "The iPhone Project Journal",
    description:
      "Design notes, material science, and buying guides for premium iPhone cases in India.",
    url: absoluteUrl("/blog"),
    type: "website",
  },
};

export default function BlogIndex() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: "Journal", url: "/blog" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "The iPhone Project Journal",
            url: absoluteUrl("/blog"),
            blogPost: blogPosts.map((post) => ({
              "@type": "BlogPosting",
              headline: post.title,
              description: post.excerpt,
              url: absoluteUrl(`/blog/${post.slug}`),
              datePublished: post.date,
              author: {
                "@type": "Person",
                name: post.author,
              },
            })),
          },
        ]}
      />
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <div className="mb-16 max-w-2xl">
          <p className="mb-4 text-xs uppercase tracking-[0.25em] text-muted-foreground">Journal</p>
          <h1 className="text-4xl font-bold leading-[0.95] md:text-6xl">
            Design notes &
            <br />
            material science.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Behind-the-scenes stories from the team building India's finest iPhone cases.
          </p>
        </div>

        <div className="grid gap-12 md:gap-16">
          {blogPosts.map((post, index) => (
            <article
              key={post.slug}
              className={`group grid gap-8 border-t border-border pt-10 md:pt-12 ${
                index === 0 ? "md:grid-cols-5" : "md:grid-cols-3"
              }`}
            >
              <div className={index === 0 ? "md:col-span-3" : "md:col-span-2"}>
                <div className="mb-4 flex items-center gap-3 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 font-medium text-secondary-foreground">
                    {post.tag}
                  </span>
                  <span>{post.date}</span>
                  <span>/</span>
                  <span>{post.readTime}</span>
                </div>
                <h2 className="text-2xl font-bold leading-[1.05] transition group-hover:opacity-70 md:text-3xl">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
                  {post.excerpt}
                </p>
                <div className="mt-6">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-medium transition-all hover:gap-3"
                  >
                    Read article
                  </Link>
                </div>
              </div>
              <div className={index === 0 ? "md:col-span-2" : "md:col-span-1"}>
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl bg-muted">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    sizes={
                      index === 0
                        ? "(min-width: 768px) 40vw, 100vw"
                        : "(min-width: 768px) 30vw, 100vw"
                    }
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
