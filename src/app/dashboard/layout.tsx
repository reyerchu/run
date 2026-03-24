"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, ClipboardList, User, MessageSquarePlus, X, Menu } from "lucide-react";

const sidebarItems = [
  { href: "/dashboard", label: "總覽", icon: BarChart3 },
  { href: "/dashboard/records", label: "跑步紀錄", icon: ClipboardList },
  { href: "/dashboard/profile", label: "個人檔案", icon: User },
  { href: "/dashboard/feedback", label: "意見反饋", icon: MessageSquarePlus },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login?callbackUrl=" + encodeURIComponent(pathname));
    }
  }, [session, status, router, pathname]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white ring-1 ring-gray-950/5 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:top-16 lg:z-40 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:block`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-5 border-b border-gray-950/5">
            <Link href="/dashboard" onClick={() => setSidebarOpen(false)}>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight hover:text-emerald-600 transition-colors">跑者儀表板</h2>
              <p className="text-xs text-gray-400 leading-5">記錄您的每一步</p>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-950/5 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="flex-1 px-3 py-4">
            <ul className="space-y-1">
              {sidebarItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/10"
                          : "text-gray-600 hover:bg-gray-950/[2.5%] hover:text-gray-900"
                      }`}
                    >
                      <item.icon className="mr-3 h-4 w-4" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="p-4 border-t border-gray-950/5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {session.user?.image ? (
                  <img
                    className="h-10 w-10 rounded-full ring-1 ring-gray-950/5"
                    src={session.user.image}
                    alt=""
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-medium ring-1 ring-emerald-600/10">
                    {session.user?.name?.[0] || "U"}
                  </div>
                )}
              </div>
              <div className="ml-3 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session.user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session.user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between h-14 px-4 bg-white ring-1 ring-gray-950/5">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-950/[2.5%] transition-colors"
          >
            <span className="sr-only">打開側邊欄</span>
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-base font-semibold text-gray-900 tracking-tight">跑者儀表板</h1>
          <div className="w-10"></div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
