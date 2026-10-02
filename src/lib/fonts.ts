import { Cormorant_Garamond, Outfit } from "next/font/google";

export const andrelookSerif = Cormorant_Garamond({
  display: "swap",
  style: ["normal", "italic"],
  subsets: ["cyrillic", "latin"],
  variable: "--font-andrelook-serif",
  weight: ["300", "400", "600"],
});

export const andrelookSans = Outfit({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-andrelook-sans",
  weight: ["300", "400", "500", "600"],
});

export const andrelookFontVariables = `${andrelookSerif.variable} ${andrelookSans.variable}`;
