function normalizeSiteUrl(rawUrl?: string) {
  const fallbackUrl = "https://theiphoneproject.in";
  const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const vercelUrl = process.env.VERCEL_URL;
  const candidate = rawUrl?.trim() || fallbackUrl;

  try {
    const parsed = new URL(candidate.startsWith("http") ? candidate : `https://${candidate}`);
    const isLocalUrl =
      parsed.hostname === "localhost" ||
      parsed.hostname === "127.0.0.1" ||
      parsed.hostname.endsWith(".local");

    if (process.env.NODE_ENV === "production" && isLocalUrl) {
      const productionCandidate = vercelProductionUrl || vercelUrl || fallbackUrl;
      const productionUrl = productionCandidate.startsWith("http")
        ? productionCandidate
        : `https://${productionCandidate}`;

      return productionUrl.replace(/\/+$/, "");
    }

    return parsed.origin.replace(/\/+$/, "");
  } catch {
    return fallbackUrl;
  }
}

export const siteConfig = {
  name: "The iPhone Project",
  url: normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
  description:
    "Premium iPhone covers and cases in India with MagSafe support, drop-tested protection, COD, free shipping, and 7-day returns.",
  phone: process.env.NEXT_PUBLIC_SUPPORT_PHONE ?? "",
  whatsappPhone: process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? "",
  email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@theiphoneproject.in",
  upiId: process.env.NEXT_PUBLIC_UPI_ID ?? "theiphoneproject@okaxis",
  businessAddress: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS ?? "Bengaluru, Karnataka, India",
};
