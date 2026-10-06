import "@/styles/globals.css";
import { andrelookFontVariables } from "@/lib/fonts";

export default function RootRedirectLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      className={andrelookFontVariables}
      data-scroll-behavior="smooth"
      lang="et"
    >
      <body>{children}</body>
    </html>
  );
}
