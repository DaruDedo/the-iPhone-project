"use client";

import { MessageCircle } from "lucide-react";

import { siteConfig } from "@/lib/site";

export function WhatsAppFloat() {
  if (!siteConfig.whatsappPhone) {
    return null;
  }

  const message = encodeURIComponent(
    "Hi The iPhone Project, I need help choosing the right iPhone cover.",
  );

  return (
    <a
      href={`https://wa.me/${siteConfig.whatsappPhone}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with The iPhone Project on WhatsApp"
      className="fixed bottom-5 right-4 z-40 grid size-12 place-items-center rounded-full border border-white/70 bg-[#25D366] text-white shadow-[0_12px_30px_rgba(0,0,0,0.18)] transition hover:scale-105"
    >
      <MessageCircle size={21} />
    </a>
  );
}
