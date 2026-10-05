"use client";

import { useEffect, useState } from "react";

export function MobileProductCta({
  label,
  productName,
}: {
  label: string;
  productName: string;
}) {
  const [formVisible, setFormVisible] = useState(false);

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
      aria-hidden={formVisible}
      className="mobile-product-cta"
      data-hidden={formVisible ? "true" : "false"}
    >
      <span>{productName}</span>
      <a href="#request">{label}</a>
    </div>
  );
}
