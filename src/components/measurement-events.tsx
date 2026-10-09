"use client";

import Link from "next/link";
import { useEffect, type ReactNode } from "react";

import { trackPublicEvent } from "@/lib/measurement/client";

export type MeasurementItem = {
  currency: string | null;
  item_brand: string | null;
  item_category: string;
  item_id: string;
  item_name: string;
  price: number | null;
};

function parameters(item: MeasurementItem) {
  return {
    ...(item.currency ? { currency: item.currency } : {}),
    items: [item],
    ...(item.price !== null ? { value: item.price } : {}),
  };
}

export function ProductViewMeasurement({ item }: { item: MeasurementItem }) {
  useEffect(() => {
    const send = () => trackPublicEvent("view_item", parameters(item));
    send();
    window.addEventListener("andrelook:consent", send);
    return () => window.removeEventListener("andrelook:consent", send);
  }, [item]);
  return null;
}

export function TrackedProductLink({
  ariaLabel,
  children,
  className,
  href,
  item,
}: {
  ariaLabel: string;
  children: ReactNode;
  className: string;
  href: string;
  item: MeasurementItem;
}) {
  return (
    <Link
      aria-label={ariaLabel}
      className={className}
      href={href}
      onClick={() => trackPublicEvent("select_item", parameters(item))}
    >
      {children}
    </Link>
  );
}
