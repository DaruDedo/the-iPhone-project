import type { Metadata } from "next";

import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = {
  title: "Warranty",
  description: "Warranty coverage for The iPhone Project iPhone covers and cases.",
};

export default function WarrantyPage() {
  return (
    <InfoPage
      eyebrow="Warranty"
      title="Built for everyday use."
      intro="The iPhone Project covers include a limited warranty against manufacturing defects."
      items={[
        {
          title: "Coverage",
          text: "Manufacturing defects are covered for 6 months from delivery.",
        },
        {
          title: "Not covered",
          text: "Normal wear, accidental damage, scratches, and misuse are not covered.",
        },
        { title: "Support", text: "Contact support with your order number and product photos." },
      ]}
    />
  );
}
