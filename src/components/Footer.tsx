"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");

  return (
    <footer className={`bg-gray-950/[2.5%] ring-1 ring-inset ring-gray-950/5 ${isDashboard ? "lg:pl-64" : ""}`}>
      <div className="container-narrow py-12">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
              <img src="/logo-2.svg" alt="MB" className="w-6 h-6" />
              Runner Will Guide
            </Link>
            <p className="mt-2 text-sm text-gray-500 max-w-[40ch] leading-7 text-pretty">
              Runner will, your guide. 為每位跑者找到下一場賽事。
            </p>
            <div className="mt-3 flex gap-4 text-xs text-gray-400 leading-7">
              <Link href="/privacy" className="hover:text-emerald-600 transition-colors">隱私政策</Link>
              <Link href="/terms" className="hover:text-emerald-600 transition-colors">服務條款</Link>
              <Link href="/disclaimer" className="hover:text-emerald-600 transition-colors">免責聲明</Link>
            </div>
          </div>

          <div className="flex gap-12">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">賽事</h4>
              <div className="space-y-2">
                <Link href="/taiwan" className="block text-sm text-gray-500 hover:text-emerald-600 transition-colors leading-7">台灣賽事</Link>
                <Link href="/international" className="block text-sm text-gray-500 hover:text-emerald-600 transition-colors leading-7">國際賽事</Link>
                <Link href="/calendar" className="block text-sm text-gray-500 hover:text-emerald-600 transition-colors leading-7">行事曆</Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">關於</h4>
              <div className="space-y-2">
                <Link href="/about" className="block text-sm text-gray-500 hover:text-emerald-600 transition-colors leading-7">關於我們</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 text-center text-xs text-gray-400 leading-7" style={{ borderTop: "1px solid rgba(17, 17, 17, 0.05)" }}>
          © {new Date().getFullYear()} Runner Will Guide by{" "}
          <a href="https://will.guide" className="hover:text-emerald-600 transition-colors" target="_blank" rel="noopener">
            will.guide
          </a>
        </div>
      </div>
    </footer>
  );
}
