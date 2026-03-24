"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { Send, Loader2, CheckCircle, Bug, Lightbulb, MessageCircle, HelpCircle } from "lucide-react";

const TYPES = [
  { value: "bug", label: "問題回報", desc: "功能異常或錯誤", icon: Bug },
  { value: "feature", label: "功能建議", desc: "希望新增的功能", icon: Lightbulb },
  { value: "general", label: "一般意見", desc: "使用體驗或建議", icon: MessageCircle },
  { value: "other", label: "其他", desc: "其他想說的話", icon: HelpCircle },
];

export default function FeedbackPage() {
  const { data: session, status } = useSession();
  const [type, setType] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  if (status === "loading") {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-4 bg-gray-200 rounded-full w-20 mb-2 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded-full w-48 animate-pulse"></div>
        </div>
        <div className="bg-white ring-1 ring-gray-950/10 shadow-sm rounded-2xl animate-pulse p-6">
          <div className="h-40 bg-gray-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!type) { setError("請選擇反饋類型"); return; }
    if (content.trim().length < 5) { setError("內容至少 5 個字"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, content: content.trim() }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        setError(data.error || "提交失敗，請稍後再試");
      }
    } catch {
      setError("網路錯誤，請稍後再試");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="space-y-8">
        <div>
          <p className="font-mono uppercase tracking-wider text-xs text-gray-500 mb-2">Feedback</p>
          <h1 className="text-3xl font-bold text-gray-950 tracking-tight">意見反饋</h1>
        </div>
        <div className="bg-white ring-1 ring-gray-950/10 shadow-sm rounded-2xl p-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 ring-1 ring-inset ring-emerald-500/10 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="h-8 w-8 text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-950 tracking-tight mb-2">感謝您的反饋！</h2>
          <p className="text-sm text-gray-500 leading-7 mb-8 text-pretty max-w-[35ch] mx-auto">我們已收到您的意見，會盡快處理。</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => { setSubmitted(false); setType(""); setContent(""); }}
              className="inline-flex items-center px-5 py-2.5 text-sm font-medium rounded-full bg-white text-gray-700 ring-1 ring-gray-950/10 shadow-sm hover:bg-gray-50 transition-colors"
            >
              繼續反饋
            </button>
            <Link
              href="/dashboard"
              className="inline-flex items-center px-5 py-2.5 text-sm font-medium rounded-full bg-emerald-600 text-white ring-1 ring-emerald-600/10 shadow-sm hover:bg-emerald-500 transition-colors"
            >
              回到儀表板
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="font-mono uppercase tracking-wider text-xs text-gray-500 mb-2">Feedback</p>
        <h1 className="text-3xl font-bold text-gray-950 tracking-tight">意見反饋</h1>
        <p className="mt-2 text-sm text-gray-500 leading-7 max-w-[40ch]">您的每一則反饋都是我們進步的動力</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* User info card */}
        <div className="bg-white ring-1 ring-gray-950/10 shadow-sm rounded-2xl p-5">
          <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider font-mono">反饋者</p>
          <div className="flex items-center gap-3">
            {session?.user?.image ? (
              <img src={session.user.image} alt="" className="h-10 w-10 rounded-full ring-1 ring-gray-950/5" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-medium ring-1 ring-emerald-600/10">
                {session?.user?.name?.[0] || "U"}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-950">{session?.user?.name}</p>
              <p className="text-xs text-gray-400">{session?.user?.email}</p>
            </div>
          </div>
        </div>

        {/* Type selection */}
        <div className="bg-white ring-1 ring-gray-950/10 shadow-sm rounded-2xl p-5">
          <p className="text-xs text-gray-400 mb-4 uppercase tracking-wider font-mono">反饋類型</p>
          <div className="grid grid-cols-2 gap-3">
            {TYPES.map((t) => {
              const Icon = t.icon;
              const isSelected = type === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={`text-left rounded-xl p-4 ring-1 shadow-sm transition-all ${
                    isSelected
                      ? "bg-emerald-50 ring-emerald-500/30"
                      : "bg-gray-950/[2.5%] ring-inset ring-gray-950/5 hover:bg-gray-950/[4%]"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2.5 ${
                    isSelected
                      ? "bg-emerald-100 ring-1 ring-inset ring-emerald-500/20"
                      : "bg-white ring-1 ring-inset ring-gray-950/5"
                  }`}>
                    <Icon className={`h-4 w-4 ${isSelected ? "text-emerald-600" : "text-gray-400"}`} />
                  </div>
                  <p className={`text-sm font-medium ${isSelected ? "text-emerald-700" : "text-gray-950"}`}>{t.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-5">{t.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white ring-1 ring-gray-950/10 shadow-sm rounded-2xl p-5">
          <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider font-mono">反饋內容</p>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="請詳細描述您的意見或建議..."
            rows={6}
            maxLength={2000}
            className="w-full rounded-xl bg-gray-950/[2.5%] ring-1 ring-inset ring-gray-950/5 px-4 py-3 text-sm text-gray-950 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:bg-white resize-none transition-colors"
          />
          <p className="text-xs text-gray-400 mt-2 text-right">{content.length} / 2000</p>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-50 ring-1 ring-inset ring-red-500/20 p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium rounded-full bg-emerald-600 text-white ring-1 ring-emerald-600/10 shadow-sm hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          提交反饋
        </button>
      </form>
    </div>
  );
}
