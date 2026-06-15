import type { Product } from "@/data/products";

export type ProductFaqItem = {
  question: string;
  answer: string;
};

function modelName(product: Product) {
  return product.selectedModel?.name ?? product.models[0] ?? "your selected iPhone";
}

function categoryFallback(product: Product): ProductFaqItem[] {
  return [
    {
      question: "How do I choose the right option?",
      answer: `Choose ${product.name} based on your iPhone setup and add it to bag. We keep the selected variant in your order so fulfilment stays accurate.`,
    },
    {
      question: "Is it ready for daily use?",
      answer: `${product.name} is made for regular iPhone use with a practical fit, clean finish, and reliable everyday handling.`,
    },
    {
      question: "Can I use it with my current case?",
      answer: `Compatibility depends on the exact case and accessory combination. For the best fit, use ${product.name} with MagSafe-ready or slim iPhone accessories.`,
    },
    {
      question: "What comes in the package?",
      answer: `You get one ${product.name} packed for safe delivery with the selected variant details printed on the order.`,
    },
    {
      question: "Can I return it?",
      answer:
        "Yes. Returns are supported within the store return window when the product is unused and packed with its original items.",
    },
  ];
}

export function getProductFaqs(product: Product): ProductFaqItem[] {
  const selectedModel = modelName(product);

  if (product.categorySlug === "covers-cases") {
    return [
      {
        question: "Will it fit my exact iPhone model?",
        answer: `${product.name} is cut model-by-model. Select ${selectedModel} before checkout and we will ship the case made for that exact camera, buttons, speaker, and charging-port layout.`,
      },
      {
        question: "Does this case work with MagSafe?",
        answer: `${product.name} is built for a clean MagSafe snap when the selected variant supports it. The slim shell keeps wireless charging and magnetic accessories easy to use.`,
      },
      {
        question: "How much protection does it give?",
        answer: `${product.name} focuses on everyday drops, raised screen edges, and camera-lip protection while keeping the phone slim in hand.`,
      },
      {
        question: "Will the case feel bulky?",
        answer: `${product.name} is designed as a slim daily case. The grip is protective without turning your iPhone into a heavy pocket brick.`,
      },
      {
        question: "Can I exchange if I choose the wrong model?",
        answer:
          "Yes, but it is best to choose the exact iPhone model before checkout. If the wrong model is ordered, support can help with exchange options under the return policy.",
      },
    ];
  }

  if (product.categorySlug === "tempered-glass") {
    return [
      {
        question: "Will this glass fit my exact iPhone?",
        answer: `Select ${selectedModel} before checkout so the glass matches the correct screen size, notch or island area, and edge shape.`,
      },
      {
        question: "Is it case friendly?",
        answer: `${product.name} is designed to leave enough room around the edge for most slim and protective cases.`,
      },
      {
        question: "Does it affect touch quality?",
        answer:
          "The glass is made for smooth swipes and daily typing, so touch response should feel close to the bare display after installation.",
      },
      {
        question: "Will it reduce display clarity?",
        answer: `${product.name} keeps the display sharp for everyday use. Privacy variants may darken side viewing by design.`,
      },
      {
        question: "Is installation included?",
        answer:
          "Installation support depends on the product kit. The product is shipped ready to install with the selected iPhone model details.",
      },
    ];
  }

  if (product.categorySlug === "camera-protection") {
    return [
      {
        question: "Will it fit my camera layout?",
        answer: `Choose ${selectedModel} so the camera protector matches the lens size and placement of your exact iPhone model.`,
      },
      {
        question: "Will photos look clear?",
        answer: `${product.name} is made for lens protection without covering the camera in a way that dulls everyday photos.`,
      },
      {
        question: "Does it affect flash?",
        answer:
          "The lens guard is shaped to keep flash and camera use clean when applied correctly.",
      },
      {
        question: "Can I use it with a case?",
        answer:
          "Yes, it is designed for normal case use, but very tight camera-lip cases should be checked before pairing.",
      },
      {
        question: "Is it easy to remove?",
        answer:
          "It can be removed carefully when needed, but avoid bending or reusing the adhesive after removal.",
      },
    ];
  }

  if (product.categorySlug === "magsafe-wallets") {
    return [
      {
        question: "Will it work with my iPhone?",
        answer: `${product.name} works best with MagSafe iPhones or MagSafe-ready cases. Non-MagSafe cases may reduce magnetic strength.`,
      },
      {
        question: "How many cards can it hold?",
        answer:
          "It is designed for slim daily carry, usually the cards you use most instead of a bulky wallet replacement.",
      },
      {
        question: "Will it stay attached?",
        answer:
          "The wallet is made to snap securely for normal daily use, but it should still be removed before rough handling or packed travel.",
      },
      {
        question: "Can I use wireless charging with it attached?",
        answer:
          "Remove the wallet before wireless charging so charging stays clean and the cards stay safe.",
      },
      {
        question: "Does it need an iPhone model selection?",
        answer:
          "No. This is a universal MagSafe accessory, so you can add it to bag without choosing an exact iPhone model.",
      },
    ];
  }

  return categoryFallback(product);
}
