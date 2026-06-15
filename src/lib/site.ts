export const siteConfig = {
  name: "The iPhone Project",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://theiphoneproject.co",
  description:
    "Premium iPhone covers and cases in India with MagSafe support, drop-tested protection, COD, free shipping, and 7-day returns.",
  phone: process.env.NEXT_PUBLIC_SUPPORT_PHONE ?? "+91-98765-43210",
  whatsappPhone: process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? "919876543210",
  email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@theiphoneproject.co",
  upiId: process.env.NEXT_PUBLIC_UPI_ID ?? "theiphoneproject@okaxis",
};
