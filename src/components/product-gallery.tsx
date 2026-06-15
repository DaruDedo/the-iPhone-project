"use client";

import Image from "next/image";
import { ImageIcon, Instagram, Play, Video } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { Product, ProductImage } from "@/data/products";
import {
  getInstagramEmbedUrl,
  inferProductMediaKind,
  type ProductMediaKind,
} from "@/lib/product-media";

const views = [
  { label: "Main view", scale: "scale-[1.02]", rotate: "rotate-0", position: "object-center" },
  { label: "Back angle", scale: "scale-[1.36]", rotate: "rotate-10", position: "object-bottom" },
  { label: "Camera detail", scale: "scale-[1.58]", rotate: "-rotate-6", position: "object-top" },
  {
    label: "Side edge",
    scale: "scale-[1.48]",
    rotate: "rotate-[34deg]",
    position: "object-center",
  },
];

type GalleryItem = ProductImage & {
  label: string;
  kind: ProductMediaKind;
  embedUrl: string | null;
  scale: string;
  rotate: string;
  position: string;
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

  const realItems = media.map<GalleryItem>((item, index) => {
    const view = views[index % views.length];
    const kind = getMediaKind(item);

    return {
      ...item,
      label: view.label,
      kind,
      embedUrl: item.embedUrl ?? getInstagramEmbedUrl(item.url),
      scale: view.scale,
      rotate: view.rotate,
      position: view.position,
    };
  });

  if (realItems.length === 1 && realItems[0]?.kind === "image") {
    return views.map((view, index) => ({
      ...realItems[0],
      id: `${realItems[0].id}-${index}`,
      label: view.label,
      scale: view.scale,
      rotate: view.rotate,
      position: view.position,
    }));
  }

  return realItems;
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

function ActiveMedia({ item, product }: { item: GalleryItem; product: Product }) {
  if (item.kind === "instagram" && item.embedUrl) {
    return (
      <iframe
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0 bg-white"
        loading="lazy"
        src={item.embedUrl}
        title={`${product.name} Instagram media`}
      />
    );
  }

  if (item.kind === "video") {
    return (
      <video
        className="absolute inset-0 h-full w-full object-cover"
        controls
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
      className={`object-cover drop-shadow-2xl transition-transform duration-700 ${item.position} ${item.scale} ${item.rotate}`}
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
      <div className="order-2 flex gap-2 overflow-x-auto pb-1 lg:order-1 lg:flex-col lg:overflow-visible lg:pb-0">
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
                <Image
                  src={item.url}
                  alt=""
                  fill
                  sizes="80px"
                  className={`object-cover ${item.position} ${item.scale} ${item.rotate}`}
                />
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
