import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Captain's Magisches Kombüsen-Kochbuch",
  description: "Dein magisches nautisches Kombüsen-Kochbuch.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={`${outfit.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
