import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import AuthProvider from "@/components/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Runner Will Guide | 跑者賽事指南",
  description: "Runner will, your guide. 為每位跑者找到下一場賽事，查詢台灣及國際賽事、報名資訊、跑者交流",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Runner Will Guide | 跑者賽事指南",
    description: "Runner will, your guide. 為每位跑者找到下一場賽事",
    url: "https://runner.will.guide",
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
