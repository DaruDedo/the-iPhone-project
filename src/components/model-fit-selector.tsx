"use client";

import Link from "next/link";
import { useState } from "react";

import { modelOptions, modelToSlug, popularModelOptions } from "@/data/products";

export function ModelFitSelector() {
  const [showAll, setShowAll] = useState(false);
  const models = showAll ? modelOptions : popularModelOptions;

  return (
    <div className="mt-8 flex flex-wrap justify-center gap-2 md:mt-12 md:gap-3">
      {models.map((model) => (
        <Link
          key={model}
          href={`/iphone/${modelToSlug(model)}`}
          className="rounded-full border border-border bg-card px-3 py-1.5 text-xs transition hover:border-foreground/30 sm:px-4 sm:py-2 sm:text-sm md:px-5 md:py-2.5"
        >
          {model}
        </Link>
      ))}
      <button
        className="rounded-full border border-foreground bg-foreground px-3 py-1.5 text-xs text-background transition hover:opacity-90 sm:px-4 sm:py-2 sm:text-sm md:px-5 md:py-2.5"
        onClick={() => setShowAll((value) => !value)}
      >
        {showAll ? "Show popular" : "More models"}
      </button>
    </div>
  );
}
