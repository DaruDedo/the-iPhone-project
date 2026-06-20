import type { Metadata } from "next";

import { InfoPage } from "@/components/info-page";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms and conditions for shopping on The iPhone Project.",
};

export default function TermsPage() {
  return (
    <InfoPage
      eyebrow="Terms"
      title="Terms & conditions."
      intro="These terms apply when you browse, order, or contact The iPhone Project through this website."
      items={[
        {
          title: "Orders",
          text: "Orders are confirmed after customer details, product selection, model compatibility, address, and payment or COD preference are submitted successfully.",
        },
        {
          title: "Product fit",
          text: "Customers are responsible for selecting the correct iPhone model. If you are unsure, contact support before placing the order.",
        },
        {
          title: "Pricing and availability",
          text: "Prices are listed in INR. Product availability, offers, discounts, COD eligibility, and delivery timelines may change based on stock, pincode, and operational constraints.",
        },
        {
          title: "Returns and warranty",
          text: "Returns, refunds, replacements, and warranty support are handled according to our shipping, returns, and warranty pages.",
        },
        {
          title: "Support",
          text: `For order help or questions, contact ${siteConfig.email}${siteConfig.phone ? ` or ${siteConfig.phone}` : ""}.`,
        },
      ]}
    />
  );
}
