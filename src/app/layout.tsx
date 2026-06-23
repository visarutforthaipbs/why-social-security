import type { Metadata } from "next";
import { Noto_Sans_Thai, Sarabun } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { Providers } from "./providers";

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans-thai",
});

const sarabun = Sarabun({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sarabun",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ประกันสังคมมีไว้ทำไม? - ร่วมกำหนดอนาคตของคุณ",
    template: "%s | ประกันสังคมมีไว้ทำไม?",
  },
  description:
    "แบบสำรวจออนไลน์สำหรับคนรุ่นใหม่ เพื่อช่วยให้เข้าใจสิทธิประกันสังคม มาตรา 33, 39, 40 และร่วมเสนอแนวทางปรับปรุงระบบให้ดียิ่งขึ้น",
  keywords: [
    "ประกันสังคม",
    "มาตรา 33",
    "มาตรา 39",
    "มาตรา 40",
    "แบบสำรวจ",
    "คนรุ่นใหม่",
    "Gen Z",
    "Gen Y",
  ],
  authors: [{ name: "Why Social Security" }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "ประกันสังคมมีไว้ทำไม? - ร่วมกำหนดอนาคตของคุณ",
    description:
      "แบบสำรวจออนไลน์สำหรับคนรุ่นใหม่ เพื่อช่วยให้เข้าใจสิทธิประกันสังคม มาตรา 33, 39, 40 และร่วมเสนอแนวทางปรับปรุงระบบให้ดียิ่งขึ้น",
    type: "website",
    url: siteUrl,
    siteName: "ประกันสังคมมีไว้ทำไม?",
    locale: "th_TH",
  },
  twitter: {
    card: "summary_large_image",
    title: "ประกันสังคมมีไว้ทำไม? - ร่วมกำหนดอนาคตของคุณ",
    description:
      "แบบสำรวจออนไลน์สำหรับคนรุ่นใหม่ เพื่อช่วยให้เข้าใจสิทธิประกันสังคม มาตรา 33, 39, 40 และร่วมเสนอแนวทางปรับปรุงระบบให้ดียิ่งขึ้น",
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${notoSansThai.variable} ${sarabun.variable}`}>
        <Providers>
          {/* The Navbar will be rendered in each page, not here */}
          <div className="pt-16 min-h-screen w-full">{children}</div>
        </Providers>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
