import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import AuthProvider from "@/components/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Marathon Board | 馬拉松賽事看板",
  description: "一站式馬拉松賽事資訊平台，查詢台灣及國際賽事、報名資訊、跑者交流",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Marathon Board | 馬拉松賽事看板",
    description: "一站式馬拉松賽事資訊平台",
    url: "https://run.will.guide",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body className={`${inter.className} bg-white text-gray-900 antialiased`}>
        <AuthProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
