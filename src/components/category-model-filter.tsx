"use client";

import { usePathname, useRouter } from "next/navigation";

import { IphoneModelSelector } from "@/components/iphone-model-selector";
import type { IphoneModel } from "@/data/products";

export function CategoryModelFilter({
  models,
  selectedModelSlug,
}: {
  models: IphoneModel[];
  selectedModelSlug?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  function chooseModel(slug: string) {
    router.push(slug ? `${pathname}?model=${slug}` : pathname);
  }

  return (
    <IphoneModelSelector
      allLabel="All iPhone models"
      className="mt-5 max-w-sm"
      includeAll
      models={models}
      onChange={chooseModel}
      value={selectedModelSlug ?? ""}
    />
  );
}
