import { notFound, permanentRedirect } from "next/navigation";

import { getProductBySlug } from "@/lib/catalog";
import { productPath } from "@/lib/routes";

export const dynamic = "force-dynamic";

export default async function LegacyProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  permanentRedirect(productPath(product));
}
