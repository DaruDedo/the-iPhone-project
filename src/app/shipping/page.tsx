import type { Metadata } from "next";

import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = {
  title: "Shipping",
  description:
    "Shipping timelines, COD availability, and delivery details for The iPhone Project orders.",
};

export default function ShippingPage() {
  return (
    <InfoPage
      eyebrow="Shipping"
      title="Fast delivery across India."
      intro="The iPhone Project orders ship from Bengaluru with free shipping on every prepaid and COD order."
      items={[
        { title: "Dispatch time", text: "Most in-stock orders dispatch within 24 hours." },
        { title: "Delivery speed", text: "Metro deliveries usually arrive in 2-4 business days." },
        { title: "COD", text: "Cash on delivery is available on supported Indian pin codes." },
      ]}
    />
  );
}
