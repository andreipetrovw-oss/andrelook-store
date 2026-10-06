"use client";

import { useEffect, useState } from "react";

import { useProductInteraction } from "./product-interaction-context";

export function MobileProductCta({
  label,
  productName,
}: {
  label: string;
  productName: string;
}) {
  const [formVisible, setFormVisible] = useState(false);
  const { drawerOpen, openOrder } = useProductInteraction();

  useEffect(() => {
    const request = document.getElementById("request");
    if (!request) return;
    const observer = new IntersectionObserver(
      ([entry]) => setFormVisible(entry?.isIntersecting ?? false),
      { rootMargin: "0px 0px -15% 0px", threshold: 0.05 },
    );
    observer.observe(request);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      aria-hidden={formVisible || drawerOpen}
      className="mobile-product-cta"
      data-hidden={formVisible || drawerOpen ? "true" : "false"}
    >
      <span>{productName}</span>
      <button onClick={(event) => openOrder(event.currentTarget)} type="button">
        {label}
      </button>
    </div>
  );
}
