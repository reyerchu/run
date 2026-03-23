"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch {
      setError("Google 註冊失敗，請稍後再試");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("密碼確認不一致");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("密碼長度至少需要 6 個字符");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // 註冊成功，自動登入
        const signInResult = await signIn("email-password", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (signInResult?.error) {
          setError("註冊成功，但登入失敗，請手動登入");
          router.push("/login");
        } else {
          router.push("/dashboard");
        }
      } else {
        setError(data.message || "註冊失敗，請稍後再試");
      }
    } catch {
      setError("註冊失敗，請檢查網路連線");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-950/[1%]">
      <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              建立您的帳號
            </h1>
            <p className="mt-2 text-sm text-gray-600 leading-7">
              已經有帳號了？{" "}
              <Link
                href="/login"
                className="font-medium text-emerald-600 hover:text-emerald-500"
              >
                立即登入
              </Link>
            </p>
          </div>

          <div className="bg-white py-8 px-6 ring-1 ring-gray-950/10 shadow-sm rounded-xl">
            {error && (
              <div className="mb-4 p-4 text-sm text-red-600 bg-red-950/[2.5%] ring-1 ring-inset ring-red-500/20 rounded-lg leading-7">
                {error}
              </div>
            )}

            {/* Google 註冊按鈕 */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 text-sm font-medium rounded-full text-gray-700 bg-white ring-1 ring-gray-950/10 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              使用 Google 註冊
            </button>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full" style={{ borderTop: "1px solid rgba(17, 17, 17, 0.1)" }} />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">或</span>
                </div>
              </div>
            </div>

            {/* 電子郵件註冊表單 */}
            <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="sr-only">
                  姓名
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="relative block w-full rounded-lg ring-1 ring-gray-950/10 px-3 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-sm sm:text-sm"
                  placeholder="姓名"
                />
              </div>

              <div>
                <label htmlFor="email" className="sr-only">
                  電子郵件地址
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="relative block w-full rounded-lg ring-1 ring-gray-950/10 px-3 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-sm sm:text-sm"
                  placeholder="電子郵件地址"
                />
              </div>

              <div>
                <label htmlFor="password" className="sr-only">
                  密碼
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="relative block w-full rounded-lg ring-1 ring-gray-950/10 px-3 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-sm sm:text-sm"
                  placeholder="密碼（至少 6 個字符）"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="sr-only">
                  確認密碼
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="relative block w-full rounded-lg ring-1 ring-gray-950/10 px-3 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-sm sm:text-sm"
                  placeholder="確認密碼"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-2 px-4 text-sm font-medium rounded-full text-white bg-emerald-600 ring-1 ring-emerald-600/10 shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? "註冊中..." : "註冊"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}