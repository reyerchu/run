"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

export default function UserMenu() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  if (status === "loading") {
    return (
      <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex items-center space-x-4">
        <Link
          href="/register"
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-emerald-600 transition-colors"
        >
          註冊
        </Link>
        <Link
          href="/login"
          className="px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          登入
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        {session.user.image ? (
          <Image
            src={session.user.image}
            alt={session.user.name || "User avatar"}
            width={32}
            height={32}
            className="rounded-full"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-medium">
            {session.user.name?.[0] || session.user.email?.[0] || "U"}
          </div>
        )}
        <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
          {session.user.name || session.user.email}
        </span>
        <svg
          className={`h-4 w-4 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="py-1">
            <Link
              href="/dashboard"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              個人儀表板
            </Link>
            <Link
              href="/dashboard/records"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              跑步紀錄
            </Link>
            <Link
              href="/dashboard/profile"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              個人檔案
            </Link>
            <hr className="my-1" />
            <button
              onClick={() => {
                setIsOpen(false);
                signOut({ callbackUrl: "/" });
              }}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
            >
              登出
            </button>
          </div>
        </div>
      )}
    </div>
  );
}