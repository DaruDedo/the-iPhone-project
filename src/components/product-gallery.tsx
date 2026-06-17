"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink, ImageIcon, Instagram, Loader2, Play, Video } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { Product, ProductImage } from "@/data/products";
import {
  getInstagramEmbedUrl,
  inferProductMediaKind,
  type ProductMediaKind,
} from "@/lib/product-media";

type GalleryItem = ProductImage & {
  label: string;
  kind: ProductMediaKind;
  embedUrl: string | null;
};

type ResolvedInstagramMedia = {
  kind: "image" | "video";
  url: string;
  thumbnail: string | null;
};

function getMediaKind(media: ProductImage) {
  return media.kind ?? inferProductMediaKind(media.url);
}

function createGalleryItems(product: Product): GalleryItem[] {
  const media = [
    product.image,
    ...product.images.filter(
      (image) => image.id !== product.image.id && image.url !== product.image.url,
    ),
  ];

  return media.map<GalleryItem>((item, index) => {
    const kind = getMediaKind(item);

    return {
      ...item,
      label: index === 0 ? "Main view" : `Gallery media ${index + 1}`,
      kind,
      embedUrl: item.embedUrl ?? getInstagramEmbedUrl(item.url),
    };
  });
}

function MediaIcon({ kind }: { kind: ProductMediaKind }) {
  if (kind === "instagram") {
    return <Instagram className="size-5" />;
  }

  if (kind === "video") {
    return <Video className="size-5" />;
  }

  return <ImageIcon className="size-5" />;
}

function InstagramMediaPlayer({ item, product }: { item: GalleryItem; product: Product }) {
  const [media, setMedia] = useState<ResolvedInstagramMedia | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    setMedia(null);
    setError("");

    fetch(`/api/media/instagram?url=${encodeURIComponent(item.url)}`)
      .then(async (response) => {
        const payload = (await response.json()) as ResolvedInstagramMedia | { error?: string };

        if (!response.ok || !("url" in payload)) {
          throw new Error("error" in payload ? payload.error : "Could not load Instagram reel.");
        }

        if (!cancelled) {
          setMedia(payload);
        }
      })
      .catch((fetchError: unknown) => {
        if (!cancelled) {
          setError(
            fetchError instanceof Error ? fetchError.message : "Could not load Instagram reel.",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [item.url]);

  if (media?.kind === "video") {
    return (
      <video
        key={media.url}
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        poster={media.thumbnail ?? product.image.url}
        src={media.url}
      />
    );
  }

  if (media?.kind === "image") {
    return (
      <img
        src={media.url}
        alt={`${product.name} Instagram media`}
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_50%_25%,rgba(255,85,0,0.24),transparent_34%),linear-gradient(135deg,#111,#050505)] p-8 text-center text-white">
      <div className="grid size-16 place-items-center rounded-full border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl">
        {error ? <Instagram className="size-7" /> : <Loader2 className="size-7 animate-spin" />}
      </div>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-white/55">
        Instagram reel
      </p>
      <h3 className="mt-2 max-w-md text-2xl font-bold md:text-4xl">{product.name}</h3>
      <p className="mt-3 max-w-sm text-sm leading-6 text-white/60">
        {error || "Loading the reel as a clean product video..."}
      </p>
      {error && (
        <Link
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
        >
          Open reel
          <ExternalLink className="size-4" />
        </Link>
      )}
    </div>
  );
}

function ActiveMedia({ item, product }: { item: GalleryItem; product: Product }) {
  if (item.kind === "instagram") {
    return <InstagramMediaPlayer item={item} product={product} />;
  }

  if (item.kind === "video") {
    return (
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        poster={product.image.url}
        src={item.url}
      />
    );
  }

  return (
    <Image
      src={item.url}
      alt={item.alt}
      fill
      priority
      sizes="(min-width: 1024px) 54vw, 100vw"
      className="object-contain"
    />
  );
}

export function ProductGallery({ product }: { product: Product }) {
  const galleryItems = useMemo(() => createGalleryItems(product), [product]);
  const [active, setActive] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const activeItem = galleryItems[active] ?? galleryItems[0];
  const imageIndexes = useMemo(
    () =>
      galleryItems.reduce<number[]>((indexes, item, index) => {
        if (item.kind === "image") {
          indexes.push(index);
        }

        return indexes;
      }, []),
    [galleryItems],
  );

  useEffect(() => {
    if (!autoRotate || imageIndexes.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActive((current) => {
        const currentPosition = imageIndexes.indexOf(current);
        return imageIndexes[(currentPosition + 1) % imageIndexes.length] ?? imageIndexes[0] ?? 0;
      });
    }, 3000);

    return () => window.clearInterval(timer);
  }, [autoRotate, imageIndexes]);

  function selectMedia(index: number) {
    const nextItem = galleryItems[index];
    setActive(index);
    setAutoRotate(nextItem?.kind === "image");
  }

  return (
    <div className="grid gap-3 lg:grid-cols-[5rem_minmax(0,1fr)] lg:items-start">
      <div className="order-2 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:order-1 lg:flex-col lg:overflow-visible lg:pb-0">
        {galleryItems.map((item, index) => (
          <button
            key={`${item.id}-${index}`}
            aria-label={item.label}
            className={`relative h-16 w-16 shrink-0 overflow-hidden bg-muted transition sm:h-20 sm:w-20 lg:w-full ${
              active === index ? "ring-2 ring-foreground/15" : "hover:opacity-90"
            }`}
            style={{
              clipPath: "polygon(8% 0, 92% 0, 100% 8%, 100% 92%, 92% 100%, 8% 100%, 0 92%, 0 8%)",
            }}
            onClick={() => selectMedia(index)}
            type="button"
          >
            {item.kind === "image" ? (
              <>
                <div className="absolute inset-0" style={{ background: product.tint }} />
                <Image src={item.url} alt="" fill sizes="80px" className="object-contain" />
              </>
            ) : (
              <div className="absolute inset-0 grid place-items-center bg-foreground text-background">
                <MediaIcon kind={item.kind} />
              </div>
            )}
            {item.kind !== "image" && (
              <span className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-white/85 text-foreground shadow-sm">
                <Play className="size-3 fill-current" />
              </span>
            )}
            {/* SVG Border Overlay */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              fill="none"
            >
              <path
                d="M 8 0 L 92 0 L 100 8 L 100 92 L 92 100 L 8 100 L 0 92 L 0 8 Z"
                stroke={active === index ? "var(--color-foreground)" : "var(--color-border)"}
                strokeWidth={active === index ? "2" : "1"}
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </button>
        ))}
      </div>

      <div className="order-1 lg:order-2">
        <div
          className="relative aspect-square overflow-hidden bg-muted"
          style={{
            clipPath: "polygon(8% 0, 92% 0, 100% 8%, 100% 92%, 92% 100%, 8% 100%, 0 92%, 0 8%)",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: activeItem?.kind === "image" ? product.tint : "oklch(0.14 0.005 270)",
            }}
          />
          {activeItem && <ActiveMedia item={activeItem} product={product} />}
          {/* SVG Border Overlay */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-20"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            fill="none"
          >
            <path
              d="M 8 0 L 92 0 L 100 8 L 100 92 L 92 100 L 8 100 L 0 92 L 0 8 Z"
              stroke="var(--color-border)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
