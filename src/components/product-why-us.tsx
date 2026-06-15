import { BadgeCheck, Headphones, PackageCheck, Truck } from "lucide-react";

const reasons = [
  {
    icon: PackageCheck,
    title: "Model-specific fit",
    text: "Every order is packed against the selected iPhone model, so cutouts, camera rings, and buttons match cleanly.",
  },
  {
    icon: BadgeCheck,
    title: "Quality checked",
    text: "Products are checked for finish, fit, and daily-use durability before they are listed for sale.",
  },
  {
    icon: Truck,
    title: "Fast India shipping",
    text: "Metro delivery starts from 1-2 days, with COD support across supported pin codes.",
  },
  {
    icon: Headphones,
    title: "Real support",
    text: "Need help choosing a model or fixing an order mistake? Support is built into the store flow.",
  },
];

export function ProductWhyUs() {
  return (
    <section className="border-y border-border bg-muted/25">
      <div className="mx-auto max-w-7xl px-3 py-12 sm:px-6 md:py-16">
        <div className="max-w-3xl">
          <p className="mb-3 text-xs uppercase tracking-[0.25em] text-muted-foreground">Why us</p>
          <h2 className="text-4xl font-bold md:text-5xl">
            Why choose The<span className="text-[#ff5500]">.i</span>Phone
            <span className="text-[#ff5500]">.</span>Project.
          </h2>
          <p className="mt-4 text-sm leading-6 text-muted-foreground md:text-base md:leading-7">
            Built for Indian iPhone users who want the right fit, fast delivery, and products that
            feel premium without making checkout complicated.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {reasons.map(({ icon: Icon, title, text }) => (
            <article key={title} className="rounded-3xl bg-card/80 p-5 md:p-6">
              <span className="grid size-10 place-items-center rounded-full bg-foreground text-background">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-5 text-lg font-bold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
