import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { blogPosts, getPostBySlug } from "@/data/blog";
import { absoluteUrl, breadcrumbJsonLd, JsonLd, siteConfig } from "@/lib/seo";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  return {
    title: post ? post.title : "Journal",
    description: post?.excerpt,
    alternates: post
      ? {
          canonical: `/blog/${post.slug}`,
        }
      : undefined,
    openGraph: post
      ? {
          title: post.title,
          description: post.excerpt,
          url: absoluteUrl(`/blog/${post.slug}`),
          type: "article",
          publishedTime: post.date,
          authors: [post.author],
        }
      : undefined,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const related = blogPosts.filter((item) => item.slug !== post.slug).slice(0, 3);
  const pageJsonLd = [
    breadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "Journal", url: "/blog" },
      { name: post.title, url: `/blog/${post.slug}` },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt,
      articleBody: post.content,
      datePublished: post.date,
      dateModified: post.date,
      url: absoluteUrl(`/blog/${post.slug}`),
      author: {
        "@type": "Person",
        name: post.author,
      },
      publisher: {
        "@type": "Organization",
        name: siteConfig.name,
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl("/icon.png"),
        },
      },
    },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <JsonLd data={pageJsonLd} />
      <article className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <div className="mb-6 flex items-center gap-3 text-[11px] uppercase tracking-wider text-muted-foreground">
          <span className="rounded-full bg-secondary px-2.5 py-0.5 font-medium text-secondary-foreground">
            {post.tag}
          </span>
          <span>{post.date}</span>
          <span>/</span>
          <span>{post.readTime}</span>
        </div>

        <h1 className="text-3xl font-bold leading-[0.95] md:text-5xl">{post.title}</h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
          {post.excerpt}
        </p>

        <div className="mt-8 flex items-center gap-3 border-y border-border py-4 text-sm text-muted-foreground">
          <div className="flex size-8 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">
            IP
          </div>
          <span className="font-medium text-foreground">{post.author}</span>
          <span>/</span>
          <span>The iPhone Project Journal</span>
        </div>

        <div className="relative my-10 aspect-[16/9] w-full overflow-hidden rounded-3xl bg-muted">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            priority
            sizes="(min-width: 768px) 768px, 100vw"
            className="object-cover"
          />
        </div>

        <div className="mt-12 text-[17px] leading-8 text-foreground/90">
          {post.content.split("\n\n").map((paragraph) => (
            <p key={paragraph} className="mb-6">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-16 border-t border-border pt-10">
          <Link href="/blog" className="text-sm font-medium">
            Back to Journal
          </Link>
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-border bg-secondary/30">
          <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
            <h2 className="mb-10 text-xl font-bold md:text-2xl">More from the Journal</h2>
            <div className="grid gap-8 md:grid-cols-3">
              {related.map((item) => (
                <div key={item.slug}>
                  <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                    <span className="rounded-full bg-background px-2 py-0.5 font-medium">
                      {item.tag}
                    </span>
                    <span>{item.readTime}</span>
                  </div>
                  <h3 className="text-lg font-bold leading-tight transition hover:opacity-70">
                    <Link href={`/blog/${item.slug}`}>{item.title}</Link>
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.excerpt}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
