"use client";

import { useEffect } from "react";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

function ToastClickDismiss() {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target;

      if (!(target instanceof HTMLElement) || target.closest("button,a")) {
        return;
      }

      const toastElement = target.closest<HTMLElement>("[data-sonner-toast]");

      if (!toastElement) {
        return;
      }

      const toastIndex = Number(toastElement.dataset.index ?? 0);
      const visibleToasts = toast
        .getToasts()
        .filter((item): item is { id: number | string } => "id" in item && !("dismiss" in item));

      toast.dismiss(visibleToasts[toastIndex]?.id);
    }

    document.addEventListener("click", handleClick);

    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <>
      <ToastClickDismiss />
      <Sonner
        className="toaster group"
        closeButton={false}
        expand
        gap={8}
        offset={18}
        position="top-center"
        visibleToasts={5}
        style={{ "--width": "fit-content", ...props.style } as React.CSSProperties}
        toastOptions={{
          duration: 2200,
          closeButton: false,
          classNames: {
            toast: "tip-toast-badge",
            content: "tip-toast-content",
            icon: "tip-toast-icon",
            title: "tip-toast-title",
            description: "tip-toast-description",
            actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
            cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
            success: "tip-toast-success",
            error: "tip-toast-error",
            warning: "tip-toast-warning",
            loading: "tip-toast-loading",
          },
        }}
        {...props}
      />
    </>
  );
};

export { Toaster };
