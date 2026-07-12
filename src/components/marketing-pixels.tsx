"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const googleTagId =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

export function trackMarketingEvent(
  eventName: string,
  params: Record<string, string | number | string[] | undefined> = {},
) {
  if (typeof window === "undefined") {
    return;
  }

  window.fbq?.("track", eventName, params);
  window.gtag?.("event", eventName, params);
}

export function MarketingPixels() {
  const pathname = usePathname();

  useEffect(() => {
    window.fbq?.("track", "PageView");

    if (googleTagId) {
      window.gtag?.("config", googleTagId, {
        page_path: `${pathname}${window.location.search}`,
      });
    }

    // Unique visitor session tracking
    if (typeof window !== "undefined") {
      let visitorId = window.localStorage.getItem("tip-visitor-id");
      if (!visitorId) {
        if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
          visitorId = crypto.randomUUID();
        } else {
          visitorId = "visitor-" + Math.random().toString(36).substring(2, 15) + "-" + Date.now();
        }
        window.localStorage.setItem("tip-visitor-id", visitorId);
      }

      void fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName: "page_view",
          payload: {
            visitorId,
            path: pathname,
          },
        }),
      }).catch(() => {});
    }
  }, [pathname]);

  return (
    <>
      {metaPixelId && (
        <>
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${metaPixelId}');
              fbq('track', 'PageView');
            `}
          </Script>
          <noscript>
            <img
              alt=""
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
            />
          </noscript>
        </>
      )}

      {googleTagId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${googleTagId}`} />
          <Script id="google-tag" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${googleTagId}');
            `}
          </Script>
        </>
      )}
    </>
  );
}
