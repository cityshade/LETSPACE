import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Cornerstone — The Foundation of Modern Property Management",
    template: "%s | Cornerstone",
  },
  description:
    "Kenya's most trusted property management platform. Automated rent collection, Paystack split payments, SMS-first communication, and intelligent enforcement — built for landlords and agents who mean business.",
  keywords: [
    "property management Kenya",
    "rent collection software Kenya",
    "M-Pesa rent collection",
    "Paystack property management",
    "landlord software Nairobi",
    "agent portal Kenya",
    "automated rent collection",
    "Cornerstone property",
  ],
  authors: [{ name: "Cornerstone Technologies Ltd" }],
  creator: "Cornerstone",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://cornerstone.co.ke"
  ),
  openGraph: {
    type: "website",
    locale: "en_KE",
    url: "https://cornerstone.co.ke",
    siteName: "Cornerstone",
    title: "Cornerstone — The Foundation of Modern Property Management",
    description:
      "Automated rent collection, SMS-first communication, and intelligent enforcement for Kenyan property professionals.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cornerstone Property Management",
    description:
      "The foundation of modern property management in Kenya.",
    creator: "@cornerstone_ke",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#BC4F1A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en-KE"
      className={`${inter.variable} ${playfair.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
