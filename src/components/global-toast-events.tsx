"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

function showRouteLoading() {
  toast.loading("Opening page", {
    duration: 10000,
    id: "route-loading",
  });
}

export function GlobalToastEvents() {
  const pathname = usePathname();
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    const timeout = window.setTimeout(() => toast.dismiss("route-loading"), 450);

    return () => window.clearTimeout(timeout);
  }, [pathname]);

  useEffect(() => {
    function handleNavigationClick(event: MouseEvent) {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest<HTMLAnchorElement>("a[href]");

      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) {
        return;
      }

      const url = new URL(anchor.href);

      if (url.origin !== window.location.origin) {
        return;
      }

      const samePage =
        url.pathname === window.location.pathname &&
        url.search === window.location.search &&
        url.hash;

      if (samePage) {
        return;
      }

      showRouteLoading();
    }

    function handleNavigationKeydown(event: KeyboardEvent) {
      if (event.key !== "Enter") {
        return;
      }

      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest<HTMLAnchorElement>("a[href]");

      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) {
        return;
      }

      const url = new URL(anchor.href);

      if (
        url.origin === window.location.origin &&
        (url.pathname !== window.location.pathname || url.search !== window.location.search)
      ) {
        showRouteLoading();
      }
    }

    function handleError(event: ErrorEvent) {
      toast.error(event.message || "Something went wrong");
    }

    function handleRejection(event: PromiseRejectionEvent) {
      const message =
        event.reason instanceof Error ? event.reason.message : "A background action failed.";

      toast.error(message);
    }

    document.addEventListener("click", handleNavigationClick, true);
    document.addEventListener("keydown", handleNavigationKeydown, true);
    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      document.removeEventListener("click", handleNavigationClick, true);
      document.removeEventListener("keydown", handleNavigationKeydown, true);
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  return null;
}
