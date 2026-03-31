import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/hooks/useCart";
import { Toaster } from "@/components/ui/sonner";

const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "afilodocs – Documentos legales claros, sin tecnicismos",
    template: "%s | afilodocs",
  },
  description:
    "Redacción y revisión de documentos legales en lenguaje claro. Precio cerrado, plazos realistas, trabajo 100% online desde Valencia.",
  metadataBase: new URL("https://afilodocs.com"),
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "afilodocs",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={dmSans.variable}>
      <body className="font-sans antialiased">
        <CartProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}
