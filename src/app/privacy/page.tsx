import type { Metadata } from "next";

import { InfoPage } from "@/components/info-page";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for The iPhone Project customers.",
};

export default function PrivacyPage() {
  return (
    <InfoPage
      eyebrow="Privacy"
      title="Privacy policy."
      intro="We collect only the information needed to process orders, provide support, improve the store, and communicate about your purchases."
      items={[
        {
          title: "Information we collect",
          text: "We may collect your name, phone number, email address, shipping address, pincode, order details, payment status, support messages, and basic site activity such as product views and cart actions.",
        },
        {
          title: "How we use it",
          text: "We use this information to process orders, arrange shipping, send order updates, answer support requests, prevent fraud, improve product availability, and measure marketing performance.",
        },
        {
          title: "Payments",
          text: "Payment details are handled by payment providers or banks. We do not store card, UPI PIN, or netbanking credentials on our servers.",
        },
        {
          title: "Sharing",
          text: "We share order information only with service providers needed to run the store, such as hosting, database, email, image hosting, analytics, payment, logistics, and customer support tools.",
        },
        {
          title: "Contact",
          text: `For privacy questions or data requests, contact us at ${siteConfig.email}.`,
        },
      ]}
    />
  );
}
