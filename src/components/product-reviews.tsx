import type { Product } from "@/data/products";
import { getProductReviews } from "@/lib/product-reviews";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="font-sans text-base tracking-[0.08em]" aria-label={`${rating} out of 5 stars`}>
      {"★".repeat(rating)}
    </span>
  );
}

export async function ProductReviews({ product }: { product: Product }) {
  const reviews = await getProductReviews(product);
  const rating = Number(product.rating).toFixed(1);

  return (
    <section className="mx-auto max-w-5xl px-3 py-12 sm:px-6 md:py-16">
      <div>
        <p className="mb-3 text-xs uppercase tracking-[0.25em] text-muted-foreground">Reviews</p>
        <h2 className="text-4xl font-bold tracking-tight md:text-5xl">{rating} out of 5</h2>
        <p className="mt-3 text-base text-muted-foreground md:text-lg">
          Based on {product.reviews} verified purchases
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {reviews.map((review, index) => (
          <article
            key={`${review.name}-${index}`}
            className="rounded-3xl border border-border bg-card/80 p-7"
          >
            <Stars rating={review.rating} />
            <p className="mt-5 text-base leading-7 text-foreground md:text-lg md:leading-8">
              &quot;{review.quote}&quot;
            </p>
            <p className="mt-5 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{review.name}</span>
              <span className="mx-2">·</span>
              Verified buyer
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
