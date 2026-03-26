import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "LETSPACE - Kenya's #1 Property Management Platform",
    template: "%s | LETSPACE",
  },
  description:
    "The complete AI-powered property management platform for Kenyan landlords and agents. M-Pesa rent collection, Claude AI insights, tenant screening, maintenance management and more.",
  keywords: [
    "property management Kenya",
    "real estate software Kenya",
    "M-Pesa rent collection",
    "landlord software Nairobi",
    "property management Nairobi",
    "tenant screening Kenya",
    "rental management software",
    "LETSPACE",
  ],
  authors: [{ name: "LETSPACE Technologies Ltd" }],
  creator: "LETSPACE",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://letspace.co.ke"),
  openGraph: {
    type: "website",
    locale: "en_KE",
    url: "https://letspace.co.ke",
    siteName: "LETSPACE",
    title: "LETSPACE - Kenya's #1 Property Management Platform",
    description: "AI-powered property management built for Kenya. M-Pesa integrated, Claude AI powered.",
  },
  twitter: {
    card: "summary_large_image",
    title: "LETSPACE - Kenya Property Management",
    description: "AI-powered property management built for Kenya.",
    creator: "@letspace_ke",
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
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-KE" className={inter.variable} suppressHydrationWarning>
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
