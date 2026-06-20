import type { Metadata } from "next";

import { InfoPage } from "@/components/info-page";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact The iPhone Project customer support for iPhone cover orders.",
};

export default function ContactPage() {
  return (
    <InfoPage
      eyebrow="Contact"
      title="We are here to help."
      intro="Reach out for order help, fit questions, returns, warranty, and bulk enquiries."
      items={[
        { title: "Email", text: siteConfig.email },
        ...(siteConfig.phone ? [{ title: "WhatsApp", text: siteConfig.phone }] : []),
        { title: "Hours", text: "Monday to Saturday, 10 AM to 7 PM IST." },
      ]}
    />
  );
}
