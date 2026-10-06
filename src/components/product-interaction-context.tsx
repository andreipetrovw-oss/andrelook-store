"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { SIZE_HELP_VALUE } from "@/lib/orders/request-constants";

type SelectionError = "colour" | "size" | null;

type ProductInteractionValue = {
  closeOrder: () => void;
  colour: string;
  drawerOpen: boolean;
  openOrder: (trigger?: HTMLElement | null) => boolean;
  restoreFocus: () => void;
  selectionError: SelectionError;
  setColour: (value: string) => void;
  setSize: (value: string) => void;
  size: string;
};

const ProductInteractionContext = createContext<ProductInteractionValue | null>(
  null,
);

export function ProductInteractionProvider({
  children,
  colourCodes,
  sizes,
}: {
  children: ReactNode;
  colourCodes: string[];
  sizes: string[];
}) {
  const [colour, setColourState] = useState(
    colourCodes.length === 1 ? (colourCodes[0] ?? "") : "",
  );
  const [size, setSizeState] = useState(
    sizes.length === 0
      ? SIZE_HELP_VALUE
      : sizes.length === 1
        ? (sizes[0] ?? "")
        : "",
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectionError, setSelectionError] = useState<SelectionError>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const setColour = useCallback((value: string) => {
    setColourState(value);
    setSelectionError((current) => (current === "colour" ? null : current));
  }, []);
  const setSize = useCallback((value: string) => {
    setSizeState(value);
    setSelectionError((current) => (current === "size" ? null : current));
  }, []);
  const openOrder = useCallback(
    (trigger?: HTMLElement | null) => {
      if (sizes.length > 0 && !size) {
        setSelectionError("size");
        return false;
      }
      if (colourCodes.length > 0 && !colour) {
        setSelectionError("colour");
        return false;
      }
      triggerRef.current = trigger ?? null;
      setSelectionError(null);
      setDrawerOpen(true);
      return true;
    },
    [colour, colourCodes.length, size, sizes.length],
  );
  const closeOrder = useCallback(() => setDrawerOpen(false), []);
  const restoreFocus = useCallback(
    () => triggerRef.current?.focus({ preventScroll: true }),
    [],
  );

  const value = useMemo(
    () => ({
      closeOrder,
      colour,
      drawerOpen,
      openOrder,
      restoreFocus,
      selectionError,
      setColour,
      setSize,
      size,
    }),
    [
      closeOrder,
      colour,
      drawerOpen,
      openOrder,
      restoreFocus,
      selectionError,
      setColour,
      setSize,
      size,
    ],
  );

  return (
    <ProductInteractionContext.Provider value={value}>
      {children}
    </ProductInteractionContext.Provider>
  );
}

export function useProductInteraction() {
  const value = useContext(ProductInteractionContext);
  if (!value) {
    throw new Error(
      "useProductInteraction must be used inside ProductInteractionProvider",
    );
  }
  return value;
}
