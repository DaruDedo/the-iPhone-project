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
        quote: `The ${product.name} glass lined up perfectly on my ${fit}. Touch response is very smooth, no lag at all.`,
      },
      {
        name: "Meera K.",
        rating: 5,
        quote:
          "Usually bubble problem comes, but this time got zero bubbles after install. Display still looks sharp and crystal clear.",
      },
      {
        name: "Ishaan G.",
        rating: 5,
        quote: "Case-friendly edges are the main win. Cover matches perfectly and does not lift the glass from sides. Worth the money.",
      },
      {
        name: "Pranav S.",
        rating: 4,
        quote: "Bhai screen guard fits edge-to-edge, quality is top notch. Delivery took 3 days but overall product is solid.",
      },
    ];
  }

  if (product.categorySlug === "camera-protection") {
    return [
      {
        name: "Kabir S.",
        rating: 5,
        quote: `The lens guard fits cleanly on my ${fit}. Photos are coming very clear, zero glare issue.`,
      },
      {
        name: "Ananya R.",
        rating: 5,
        quote: "Easy to align and camera bump feels safe now. Quality is very nice for daily use.",
      },
      {
        name: "Dev M.",
        rating: 4,
        quote: "Solid protection. Bulky bhi nahi lagta and snaps perfectly. Highly recommended.",
      },
    ];
  }

  if (product.categorySlug === "magsafe-wallets") {
    return [
      {
        name: "Arjun V.",
        rating: 5,
        quote: `Magnet is quite strong. It snaps well on my MagSafe case and carries my cards cleanly. Masterpiece product.`,
      },
      {
        name: "Tanya B.",
        rating: 5,
        quote: "The finish feels super premium and it is much slimmer than expected. Looks very stylish.",
      },
      {
        name: "Nikhil J.",
        rating: 4,
        quote: "Overall mast wallet hai. Card holds tightly and comes out easily when pushed. Delivery was also fast.",
      },
    ];
  }

  if (product.categorySlug === "accessories") {
    return [
      {
        name: "Samar A.",
        rating: 5,
        quote: `Very practical and compact. Quality is really good for this price, value for money.`,
      },
      {
        name: "Priya N.",
        rating: 5,
        quote: "Packaging was neat and simple. Works flawlessly with my iPhone, no complaints at all.",
      },
      {
        name: "Ritvik C.",
        rating: 4,
        quote: "Solid everyday accessory. Useful product, delivery was fast as well.",
      },
    ];
  }

  return [
    {
      name: "Aarav S.",
      rating: 5,
      quote: `Lightest case I have owned. Matches the phone frame beautifully and grip is also super.`,
    },
    {
      name: "Diya M.",
      rating: 5,
      quote: "Dropped my phone on marble yesterday. Bach gaya! Not a single scratch. Worth every rupee.",
    },
    {
      name: "Vivaan R.",
      rating: 5,
      quote: `The fit on my ${fit} is exact, and clicky buttons are too good. Premium feel at a reasonable price.`,
    },
    {
      name: "Ayush T.",
      rating: 5,
      quote: "Cover is absolute fire, looking very premium. In-hand feel is top-notch.",
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
