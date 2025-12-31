import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import { BackgroundEffects } from "@/components/ui/background-effects";

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Proclusive - High-Trust B2B Referral Network for Construction",
  description: "Join the Founding 50 members in an exclusive, pre-vetted professional network. 15-point Vetting-as-a-Service verification for construction industry professionals.",
  keywords: "B2B referrals, construction network, professional vetting, VaaS",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-icon.svg", type: "image/svg+xml" },
    ],
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorantGaramond.variable} ${outfit.variable}`}>
      <body className="antialiased" style={{ background: '#1a1d27', fontFamily: 'var(--font-outfit), system-ui, sans-serif' }}>
        <Providers>
          <BackgroundEffects />
          <div className="relative z-10">
            <Navigation />
            <main>{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
