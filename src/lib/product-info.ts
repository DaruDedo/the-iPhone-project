import type { Product } from "@/data/products";

export type ProductSpecRow = {
  label: string;
  value: string;
};

export type ProductShippingCard = {
  title: string;
  time: string;
  description: string;
};

export type ProductInfoContent = {
  inBox: string[];
  keyFeatures: string[];
  specs: ProductSpecRow[];
  shipping: ProductShippingCard[];
};

function selectedFit(product: Product) {
  return product.selectedModel?.name ?? product.models[0] ?? "compatible iPhone models";
}

function productLine(product: Product) {
  if (product.requiresModelFit) {
    return `The iPhone Project ${product.name} ${product.category.toLowerCase()} for ${selectedFit(product)}`;
  }

  return `The iPhone Project ${product.name}`;
}

function specsFor(product: Product): ProductSpecRow[] {
  if (product.categorySlug === "tempered-glass") {
    return [
      { label: "Hardness", value: "9H tempered glass" },
      { label: "Coverage", value: "Edge-to-edge" },
      { label: "Touch", value: "High-response coating" },
      {
        label: "Finish",
        value: product.name.includes("Privacy") ? "Privacy filter" : "Crystal clear",
      },
      { label: "Fit", value: selectedFit(product) },
      { label: "Install", value: "Bubble-resistant" },
    ];
  }

  if (product.categorySlug === "camera-protection") {
    return [
      { label: "Material", value: "Optical-grade glass" },
      { label: "Coverage", value: "Individual lens guard" },
      { label: "Clarity", value: "HD photo safe" },
      { label: "Flash", value: "Flash-safe cutout" },
      { label: "Fit", value: selectedFit(product) },
      { label: "Install", value: "Peel-and-align" },
    ];
  }

  if (product.categorySlug === "magsafe-wallets") {
    return [
      { label: "Capacity", value: "2-card daily carry" },
      { label: "Attachment", value: "MagSafe magnetic snap" },
      { label: "Material", value: "Soft-touch vegan leather" },
      { label: "Profile", value: "Slim pocket fit" },
      { label: "Compatibility", value: "MagSafe iPhone or case" },
      { label: "Charging", value: "Remove before wireless charge" },
    ];
  }

  if (product.categorySlug === "accessories") {
    return [
      { label: "Compatibility", value: "iPhone-ready" },
      { label: "Use", value: "Daily carry" },
      { label: "Finish", value: "Matte premium finish" },
      { label: "Warranty", value: "1-year limited" },
      { label: "Quality", value: "The iPhone Project tested" },
      { label: "Support", value: "India support" },
    ];
  }

  return [
    { label: "Weight", value: "22g" },
    { label: "Thickness", value: "1.2mm" },
    { label: "Material", value: "Custom polycarbonate blend" },
    { label: "Drop protection", value: "3 metres" },
    { label: "MagSafe", value: "Precision-milled array" },
    { label: "UV resistance", value: "Anti-yellowing additive" },
  ];
}

function inBoxFor(product: Product): string[] {
  if (product.categorySlug === "tempered-glass") {
    return [
      `${productLine(product)}`,
      "Microfibre cleaning cloth",
      "Dust removal sticker set",
      "The iPhone Project authenticity card",
      "1-year limited warranty",
    ];
  }

  if (product.categorySlug === "camera-protection") {
    return [
      `${productLine(product)}`,
      "Microfibre cleaning cloth",
      "Dust removal sticker",
      "The iPhone Project authenticity card",
      "1-year limited warranty",
    ];
  }

  if (product.categorySlug === "magsafe-wallets" || product.categorySlug === "accessories") {
    return [
      `${productLine(product)}`,
      "The iPhone Project authenticity card",
      "Care and setup guide",
      "1-year limited warranty",
    ];
  }

  return [
    `${productLine(product)}`,
    "Microfibre cleaning cloth",
    "The iPhone Project authenticity card",
    "1-year limited warranty",
  ];
}

export function getProductInfoContent(product: Product): ProductInfoContent {
  return {
    inBox: inBoxFor(product),
    keyFeatures:
      product.features.length > 0
        ? product.features.map((feature) => feature)
        : ["Model-specific fit", "Premium finish", "Fast dispatch", "India support"],
    specs: specsFor(product),
    shipping: [
      {
        title: "Metro cities",
        time: "1-2 days",
        description: "Delhi, Mumbai, Bengaluru, Chennai, Hyderabad, Kolkata, Pune",
      },
      {
        title: "Tier-2 cities",
        time: "2-4 days",
        description: "Jaipur, Lucknow, Ahmedabad, Chandigarh, Kochi, Indore, Nagpur",
      },
      {
        title: "Rest of India",
        time: "4-7 days",
        description: "27,000+ pin codes covered. COD available everywhere we ship.",
      },
    ],
  };
}
