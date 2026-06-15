export type ProductTemplateKey =
  | "covers-cases.default"
  | "covers-cases.printed"
  | "covers-cases.clear"
  | "tempered-glass.clear"
  | "tempered-glass.privacy"
  | "camera-protection.default"
  | "magsafe-wallets.default"
  | "accessories.default";

export type ProductTemplate = {
  key: ProductTemplateKey;
  label: string;
  categorySlug: string;
  description: string;
  defaultPrice: number;
  defaultTag: string;
  requiresModelFit: boolean;
  features: string[];
  seoTitle: string;
  seoDescription: string;
};

export type ProductTemplateInput = {
  productName: string;
  categoryTitle?: string;
  modelNames?: string[];
};

function fitText(models: string[] = []) {
  if (models.length === 0) {
    return "selected iPhone models";
  }

  if (models.length === 1) {
    return models[0];
  }

  if (models.length === 2) {
    return `${models[0]} and ${models[1]}`;
  }

  return `${models.slice(0, 2).join(", ")} and ${models.length - 2} more iPhone models`;
}

function templateText(text: string, input: ProductTemplateInput) {
  const productName = input.productName || "The iPhone Project product";
  const categoryTitle = input.categoryTitle || "iPhone accessory";
  const models = fitText(input.modelNames);

  return text
    .replaceAll("{productName}", productName)
    .replaceAll("{categoryTitle}", categoryTitle)
    .replaceAll("{modelNames}", models);
}

export const productTemplates: ProductTemplate[] = [
  {
    key: "covers-cases.default",
    label: "Cover / case default",
    categorySlug: "covers-cases",
    description:
      "{productName} is a model-specific iPhone case for {modelNames}, made for everyday grip, raised camera protection, and a clean premium finish.",
    defaultPrice: 1499,
    defaultTag: "New",
    requiresModelFit: true,
    features: [
      "Model-specific fit",
      "Raised camera lip",
      "Scratch-resistant finish",
      "Slim daily grip",
    ],
    seoTitle: "{productName} iPhone Cover for {modelNames} | The iPhone Project India",
    seoDescription:
      "Buy {productName} iPhone cover for {modelNames}. Premium fit, camera protection, fast India shipping, COD support, and 7-day returns.",
  },
  {
    key: "covers-cases.printed",
    label: "Printed / character cover",
    categorySlug: "covers-cases",
    description:
      "{productName} is a printed iPhone cover for {modelNames}, built for clean artwork visibility, everyday protection, and a comfortable slim grip.",
    defaultPrice: 1299,
    defaultTag: "Trending",
    requiresModelFit: true,
    features: [
      "Printed artwork finish",
      "Model-specific fit",
      "Raised screen edge",
      "Camera bump protection",
    ],
    seoTitle: "{productName} Printed iPhone Case for {modelNames} | The iPhone Project",
    seoDescription:
      "Shop {productName} printed iPhone case for {modelNames}. Slim protective cover with premium artwork, fast delivery, and COD in India.",
  },
  {
    key: "covers-cases.clear",
    label: "Clear / frosted case",
    categorySlug: "covers-cases",
    description:
      "{productName} is a clear iPhone case for {modelNames}, designed to show the iPhone finish while adding slim scratch and camera protection.",
    defaultPrice: 1199,
    defaultTag: "Fresh",
    requiresModelFit: true,
    features: [
      "Clear back",
      "Anti-yellowing finish",
      "Raised lens lip",
      "Wireless charging friendly",
    ],
    seoTitle: "{productName} Clear iPhone Case for {modelNames} | The iPhone Project",
    seoDescription:
      "Buy {productName} clear iPhone case for {modelNames}. Anti-yellowing finish, slim protection, fast India shipping, and easy returns.",
  },
  {
    key: "tempered-glass.clear",
    label: "Clear tempered glass",
    categorySlug: "tempered-glass",
    description:
      "{productName} is a clear tempered glass screen protector for {modelNames}, made for sharp display clarity, smooth touch, and everyday scratch protection.",
    defaultPrice: 499,
    defaultTag: "Essential",
    requiresModelFit: true,
    features: [
      "9H hardness",
      "Crystal-clear display",
      "Smooth touch response",
      "Case-friendly edges",
    ],
    seoTitle: "{productName} Tempered Glass for {modelNames} | The iPhone Project",
    seoDescription:
      "Shop {productName} tempered glass for {modelNames}. Clear display protection, smooth touch, fast India shipping, and COD support.",
  },
  {
    key: "tempered-glass.privacy",
    label: "Privacy tempered glass",
    categorySlug: "tempered-glass",
    description:
      "{productName} is a privacy tempered glass for {modelNames}, made to protect the screen and reduce side viewing in public places.",
    defaultPrice: 699,
    defaultTag: "New",
    requiresModelFit: true,
    features: ["Privacy filter", "9H hardness", "Case-friendly fit", "Oleophobic coating"],
    seoTitle: "{productName} Privacy Glass for {modelNames} | The iPhone Project",
    seoDescription:
      "Buy {productName} privacy tempered glass for {modelNames}. Side-view privacy, screen protection, quick delivery, and COD in India.",
  },
  {
    key: "camera-protection.default",
    label: "Camera protection",
    categorySlug: "camera-protection",
    description:
      "{productName} protects the camera lenses on {modelNames} with a slim, photo-safe guard that keeps flash and everyday shots clear.",
    defaultPrice: 399,
    defaultTag: "Trending",
    requiresModelFit: true,
    features: ["HD lens clarity", "Flash-safe design", "Scratch-resistant glass", "Easy alignment"],
    seoTitle: "{productName} Camera Lens Protector for {modelNames} | The iPhone Project",
    seoDescription:
      "Shop {productName} camera protection for {modelNames}. HD lens clarity, scratch resistance, fast shipping, and COD support.",
  },
  {
    key: "magsafe-wallets.default",
    label: "MagSafe wallet",
    categorySlug: "magsafe-wallets",
    description:
      "{productName} is a slim MagSafe wallet made for iPhone users who want quick card carry with a clean magnetic snap.",
    defaultPrice: 1499,
    defaultTag: "New",
    requiresModelFit: false,
    features: ["MagSafe snap", "Slim card carry", "Soft-touch finish", "Works with MagSafe cases"],
    seoTitle: "{productName} MagSafe Wallet for iPhone | The iPhone Project India",
    seoDescription:
      "Buy {productName} MagSafe wallet for iPhone. Slim card carry, premium magnetic snap, fast India shipping, and COD support.",
  },
  {
    key: "accessories.default",
    label: "Accessory default",
    categorySlug: "accessories",
    description:
      "{productName} is an iPhone-ready accessory built for daily use, clean setup, and dependable support from The iPhone Project across India.",
    defaultPrice: 599,
    defaultTag: "Essential",
    requiresModelFit: false,
    features: ["iPhone-ready", "Daily carry", "Premium finish", "India support"],
    seoTitle: "{productName} iPhone Accessory | The iPhone Project India",
    seoDescription:
      "Shop {productName} for iPhone users in India. Premium daily accessory, quick delivery, COD support, and easy returns.",
  },
];

export function getTemplatesForCategory(categorySlug: string) {
  return productTemplates.filter((template) => template.categorySlug === categorySlug);
}

export function getDefaultTemplateForCategory(categorySlug: string) {
  return getTemplatesForCategory(categorySlug)[0] ?? productTemplates[0];
}

export function getProductTemplate(key?: string, categorySlug = "covers-cases") {
  return (
    productTemplates.find((template) => template.key === key) ??
    getDefaultTemplateForCategory(categorySlug)
  );
}

export function applyProductTemplate(template: ProductTemplate, input: ProductTemplateInput) {
  return {
    description: templateText(template.description, input),
    features: template.features.map((feature) => templateText(feature, input)),
    seoTitle: templateText(template.seoTitle, input),
    seoDescription: templateText(template.seoDescription, input),
  };
}

export function nameFromFilename(filename: string) {
  const withoutExtension = filename.replace(/\.[^.]+$/, "");
  const cleaned = withoutExtension
    .replace(/[_-]+/g, " ")
    .replace(/\b(iphone|cover|case|tempered|glass|camera|lens|protector|magsafe)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  return (
    cleaned ||
    withoutExtension.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim() ||
    "New Product"
  )
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function slugifyProduct(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
