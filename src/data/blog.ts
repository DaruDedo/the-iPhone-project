import designImg from "@/assets/blog/iphone-17-design-language.png";
import mythsImg from "@/assets/blog/drop-test-myths.png";
import magsafeImg from "@/assets/blog/magsafe-charging-speed.png";
import indiaImg from "@/assets/blog/india-made-possible.png";
import type { StaticImageData } from "next/image";

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  tag: string;
  coverImage: StaticImageData;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "iphone-17-design-language",
    title: "The iPhone 17 design language and what it means for your case",
    excerpt:
      "Apple shifted the silhouette this year. Thinner rails, a camera bar across the top edge, and new anodised colours changed how a case has to be engineered.",
    content: `Apple's iPhone 17 lineup brings one of the biggest shape changes in years. The new camera bar on the Pro models is not just visual. It changes the geometry around the top edge, the button cutouts, and the way impact travels through the frame.

At The iPhone Project Studio, we retooled the Frosted Air series around exact dimensional data so the case hugs every contour without adding bulk. The rails are thinner this year, so we reduced the wall thickness to 1.2mm while keeping 3m drop protection through a honeycomb substructure.

The anodised colours are matched in small batches at our Bengaluru facility. Each batch is checked against physical device shells so the case feels like it belongs with the phone, not beside it.

MagSafe positioning also gets special attention. Each model has a dedicated magnet map so wallets, stands, chargers, and car mounts snap cleanly into place.`,
    author: "The iPhone Project Editorial",
    date: "13 Jun 2026",
    readTime: "5 min read",
    tag: "Design",
    coverImage: designImg,
  },
  {
    slug: "drop-test-myths",
    title: "Drop-test myths and what those 3-metre claims actually mean",
    excerpt:
      "Every brand promises serious protection. Here is how to read the spec, and why the shape of the case matters as much as the material.",
    content: `Drop protection is more than a height printed on a box. A useful test needs repeated drops, different angles, and inspection after every impact.

The Frosted Air case uses reinforced corners because most real drops land on an edge first. Those corners distribute force through a micro-cell pattern before it reaches the phone's metal rail.

Protection usually adds weight. Our challenge was keeping the case pocket-friendly while still making it feel reassuring. The result is a 22g shell with a raised camera lip, a soft internal rim, and a hard outer back.

When you compare cases, ask how many drops were tested, what surface was used, and whether the phone was inspected after the full sequence.`,
    author: "Rohan Mehta",
    date: "10 Jun 2026",
    readTime: "6 min read",
    tag: "Engineering",
    coverImage: mythsImg,
  },
  {
    slug: "magsafe-charging-speed",
    title: "Does your case slow down MagSafe charging?",
    excerpt:
      "MagSafe depends on alignment. A tiny shift in the magnet ring can turn a clean snap into heat, wobble, and slower charging.",
    content: `MagSafe charging is sensitive to alignment. Thickness matters, but the bigger issue is whether the magnet array lines up with the phone's coil.

The iPhone Project cases use model-specific magnet maps instead of a generic ring. That keeps charging pucks centered and helps wallets and stands hold their position.

We also tune the backplate thickness around the coil area. The goal is simple: make the case feel invisible when you charge, mount, or carry the phone.

If you use MagSafe every day, a well-aligned case is not a luxury. It is the difference between an accessory that feels native and one you keep adjusting.`,
    author: "Priya Nair",
    date: "05 Jun 2026",
    readTime: "4 min read",
    tag: "Tech",
    coverImage: magsafeImg,
  },
  {
    slug: "india-made-possible",
    title: "Made in India: why we build every case in Bengaluru",
    excerpt:
      "Local manufacturing lets our design, tooling, colour, and quality teams work within the same feedback loop.",
    content: `We build close to home because speed and control matter. When a wall needs to move by 0.1mm, the tooling team can adjust it quickly. When a colour drifts, we catch it before the batch grows.

Our polycarbonate blends are selected for impact resistance, finish, and long-term hand feel. The material has to protect the phone, but it also has to feel calm in the pocket and clean in the hand.

Local production also makes the customer experience better. Inventory moves faster, replacements are easier, and quality issues are easier to trace.

Made in India is not just a label for us. It is the operating system behind the product.`,
    author: "The iPhone Project Editorial",
    date: "01 Jun 2026",
    readTime: "7 min read",
    tag: "Studio",
    coverImage: indiaImg,
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}
