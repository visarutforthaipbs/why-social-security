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

export const metadata: Metadata = {
  title: "ประกันสังคมมีไว้ทำไม? - ร่วมกำหนดอนาคตของคุณ",
  description:
    "เข้าร่วมแคมเปญเพื่อร่วมกำหนดอนาคตของระบบประกันสังคมในประเทศไทยสำหรับคนรุ่นใหม่ Gen Z และ Gen Y",
  keywords:
    "ประกันสังคม, ไทย, มาตรา 33, มาตรา 39, มาตรา 40, คนรุ่นใหม่, Gen Z, Gen Y",
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
