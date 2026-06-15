import type { Metadata } from "next";

import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = {
  title: "Returns",
  description: "The iPhone Project return policy for iPhone covers and cases.",
};

export default function ReturnsPage() {
  return (
    <InfoPage
      eyebrow="Returns"
      title="7-day easy returns."
      intro="If the fit, finish, or feel is not right, request a return within 7 days of delivery."
      items={[
        { title: "Return window", text: "Returns are accepted within 7 days of delivery." },
        {
          title: "Condition",
          text: "Products should be unused, undamaged, and in original packaging.",
        },
        {
          title: "Pickup",
          text: "Return pickup is arranged wherever our logistics partners support it.",
        },
      ]}
    />
  );
}
