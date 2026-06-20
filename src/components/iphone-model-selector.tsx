"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Smartphone } from "lucide-react";

type SelectorModel = {
  slug: string;
  name: string;
};

export function IphoneModelSelector({
  models,
  value,
  onChange,
  includeAll = false,
  allLabel = "All iPhone models",
  label = "iPhone model",
  className = "",
}: {
  models: SelectorModel[];
  value?: string;
  onChange: (slug: string) => void;
  includeAll?: boolean;
  allLabel?: string;
  label?: string;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const selectedModel = models.find((model) => model.slug === value);
  const selectedLabel = selectedModel?.name ?? allLabel;

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function chooseModel(slug: string) {
    onChange(slug);
    setIsOpen(false);
  }

  return (
    <div ref={rootRef} className={`relative w-full min-w-0 ${className}`}>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:tracking-[0.24em]">
        {label}
      </p>
      <button
        type="button"
        className="flex h-12 w-full items-center justify-between rounded-full border border-border bg-white/70 px-4 text-left text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_12px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl transition hover:border-foreground/25"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-foreground text-background">
            <Smartphone className="size-3.5" />
          </span>
          <span className="truncate font-medium">{selectedLabel}</span>
        </span>
        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-40 overflow-hidden rounded-2xl border border-white/55 bg-white/85 p-1.5 shadow-[0_22px_60px_rgba(0,0,0,0.16)] backdrop-blur-2xl">
          <div className="max-h-72 overflow-y-auto pr-1">
            {includeAll && (
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium transition hover:bg-foreground/5"
                onClick={() => chooseModel("")}
              >
                {allLabel}
                {!value && <Check className="size-4" />}
              </button>
            )}
            {models.map((model) => (
              <button
                key={model.slug}
                type="button"
                className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-foreground/5"
                onClick={() => chooseModel(model.slug)}
              >
                <span className="min-w-0 truncate">{model.name}</span>
                {value === model.slug && <Check className="size-4" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
