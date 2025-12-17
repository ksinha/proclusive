import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import { BackgroundEffects } from "@/components/ui/background-effects";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "800"],
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
    <html lang="en" className={inter.variable}>
      <body className="antialiased" style={{ background: '#1a1d27' }}>
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
