import type { Metadata } from "next";
import { Poppins, Cormorant_Garamond } from "next/font/google";
import { CartProvider } from "@/lib/cart";
import "./globals.css";
import { Suspense } from "react";
import WhatsAppButton from "@/components/WhatsAppButton";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Abrar Store – Electronics & Accessories",
  description: "Premium ceiling fans, air coolers and home appliances",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">
        <CartProvider>{children}</CartProvider>
        <Suspense fallback={null}>
          <WhatsAppButton />
        </Suspense>
      </body>
    </html>
  );
}