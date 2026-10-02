import "@/styles/globals.css";
import { andrelookFontVariables } from "@/lib/fonts";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html className={andrelookFontVariables} lang="en">
      <body>{children}</body>
    </html>
  );
}
