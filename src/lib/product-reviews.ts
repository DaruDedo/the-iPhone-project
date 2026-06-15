import { getDb } from "@/db/client";
import * as schema from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import type { Product } from "@/data/products";

export type ProductReview = {
  name: string;
  rating: number;
  quote: string;
};

function productFit(product: Product) {
  return product.selectedModel?.name ?? product.models[0] ?? "my iPhone";
}

export function getStaticProductReviews(product: Product): ProductReview[] {
  const fit = productFit(product);

  if (product.categorySlug === "tempered-glass") {
    return [
      {
        name: "Rohan P.",
        rating: 5,
        quote: `The ${product.name} glass lined up perfectly on my ${fit}. Touch still feels smooth.`,
      },
      {
        name: "Meera K.",
        rating: 5,
        quote:
          "No bubbles after install, and the display still looks sharp. Exactly what I needed.",
      },
      {
        name: "Ishaan G.",
        rating: 4,
        quote: "Case-friendly edges are the main win. My cover does not lift the glass.",
      },
    ];
  }

  if (product.categorySlug === "camera-protection") {
    return [
      {
        name: "Kabir S.",
        rating: 5,
        quote: `The lens guard fits cleanly on my ${fit}. Photos still look clear.`,
      },
      {
        name: "Ananya R.",
        rating: 5,
        quote: "Easy to align and the camera bump feels safer in daily use.",
      },
      {
        name: "Dev M.",
        rating: 4,
        quote: "Good protection without making the camera area bulky.",
      },
    ];
  }

  if (product.categorySlug === "magsafe-wallets") {
    return [
      {
        name: "Arjun V.",
        rating: 5,
        quote: `${product.name} snaps well on my MagSafe case and carries my two cards cleanly.`,
      },
      {
        name: "Tanya B.",
        rating: 5,
        quote: "The finish feels premium and it is slimmer than the wallet I used before.",
      },
      {
        name: "Nikhil J.",
        rating: 4,
        quote: "Strong enough for daily carry. I remove it before charging and it works fine.",
      },
    ];
  }

  if (product.categorySlug === "accessories") {
    return [
      {
        name: "Samar A.",
        rating: 5,
        quote: `${product.name} feels practical, compact, and easy to carry with the rest of my iPhone setup.`,
      },
      {
        name: "Priya N.",
        rating: 5,
        quote: "Good finish and simple packaging. It does what it says without fuss.",
      },
      {
        name: "Ritvik C.",
        rating: 4,
        quote: "Solid everyday accessory. Delivery was faster than expected.",
      },
    ];
  }

  return [
    {
      name: "Aarav S.",
      rating: 5,
      quote: `Lightest case I have owned. The ${product.name.toLowerCase()} finish matches the iPhone frame beautifully.`,
    },
    {
      name: "Diya M.",
      rating: 5,
      quote: "Dropped my phone on marble. Not a scratch. Worth every rupee.",
    },
    {
      name: "Vivaan R.",
      rating: 5,
      quote: `The fit on my ${fit} is exact, and the buttons still feel clicky.`,
    },
  ];
}

export async function getProductReviews(product: Product): Promise<ProductReview[]> {
  const db = getDb();
  if (db && product.id) {
    try {
      const dbReviews = await db.query.productReviews.findMany({
        where: (reviews, { eq, and }) =>
          and(eq(reviews.productId, product.id), eq(reviews.isApproved, true)),
        orderBy: [desc(schema.productReviews.createdAt)],
      });

      if (dbReviews.length > 0) {
        return dbReviews.map((r) => ({
          name: r.name,
          rating: r.rating,
          quote: r.quote,
        }));
      }
    } catch (err) {
      console.warn("Could not query DB reviews:", err);
    }
  }

  return getStaticProductReviews(product);
}
