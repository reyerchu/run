"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  bio: string | null;
  createdAt: string;
}

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
  });

  useEffect(() => {
    if (session?.user) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setFormData({
          name: data.name || "",
          bio: data.bio || "",
        });
      }
    } catch (error) {
      console.error("獲取個人資料失敗:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
        await update({
          ...session,
          user: { ...session?.user, name: updatedProfile.name },
        });
        alert("個人資料更新成功！");
      } else {
        const data = await response.json();
        alert(data.error || "更新失敗，請稍後再試");
      }
    } catch (error) {
      console.error("更新錯誤:", error);
      alert("更新失敗，請檢查網路連線");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        <div className="bg-white ring-1 ring-gray-950/10 shadow-sm rounded-2xl p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-10 bg-gray-100 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!session || !profile) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="font-mono uppercase tracking-wider text-xs text-gray-500 mb-2">Profile</p>
        <h1 className="text-3xl font-bold text-gray-950 tracking-tight">個人檔案</h1>
        <p className="mt-2 text-sm text-gray-500 leading-7 max-w-[40ch]">
          管理您的帳號資訊和偏好設定
        </p>
      </div>

      {/* Avatar + Name card */}
      <div className="bg-white ring-1 ring-gray-950/10 shadow-sm rounded-2xl p-6">
        <div className="flex items-center gap-5 mb-8">
          {profile.image ? (
            <img
              className="h-16 w-16 rounded-full object-cover ring-2 ring-gray-950/5"
              src={profile.image}
              alt=""
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xl font-semibold ring-2 ring-emerald-600/10">
              {profile.name?.[0] || profile.email?.[0] || "U"}
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-950 tracking-tight">
              {profile.name || "未設定姓名"}
            </h3>
            <p className="text-sm text-gray-500">{profile.email}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              加入日期：{new Date(profile.createdAt).toLocaleDateString('zh-TW')}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
              姓名
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleInputChange}
              className="block w-full rounded-xl bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-950/10 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="輸入您的姓名"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
              電子郵件
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={profile.email || ""}
              disabled
              className="block w-full rounded-xl bg-gray-950/[2.5%] px-4 py-2.5 text-sm text-gray-500 ring-1 ring-inset ring-gray-950/5"
            />
            <p className="mt-1.5 text-xs text-gray-400 leading-5">
              電子郵件無法修改。如需變更，請聯繫客服。
            </p>
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1.5">
              個人簡介
            </label>
            <textarea
              name="bio"
              id="bio"
              rows={4}
              value={formData.bio}
              onChange={handleInputChange}
              className="block w-full rounded-xl bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-950/10 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="介紹一下自己的跑步經歷或目標..."
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-5 py-2.5 text-sm font-medium rounded-full text-white bg-emerald-600 shadow-sm ring-1 ring-emerald-600/10 hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "儲存中..." : "儲存變更"}
            </button>
          </div>
        </form>
      </div>

      {/* Account info */}
      <div className="bg-white ring-1 ring-gray-950/10 shadow-sm rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-950/5">
          <h3 className="text-base font-semibold text-gray-950 tracking-tight">帳號資訊</h3>
        </div>
        <div className="px-6 divide-y divide-gray-950/5">
          <div className="py-4 flex justify-between items-center">
            <p className="text-sm text-gray-500">帳號 ID</p>
            <p className="text-sm font-mono text-gray-900">{profile.id.slice(0, 12)}...</p>
          </div>
          <div className="py-4 flex justify-between items-center">
            <p className="text-sm text-gray-500">建立時間</p>
            <p className="text-sm text-gray-900">
              {new Date(profile.createdAt).toLocaleString('zh-TW')}
            </p>
          </div>
          <div className="py-4 flex justify-between items-center">
            <p className="text-sm text-gray-500">登入方式</p>
            <p className="text-sm text-gray-900">
              {profile.image && profile.image.includes('googleusercontent')
                ? "Google OAuth"
                : "電子郵件密碼"
              }
            </p>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-red-50/50 ring-1 ring-red-200 rounded-2xl p-6">
        <h3 className="text-base font-semibold text-red-900 tracking-tight">危險操作</h3>
        <p className="text-sm text-red-600/80 mt-1 mb-4 leading-7 text-pretty max-w-[45ch]">
          刪除帳號後所有資料將永久移除，此操作不可逆。
        </p>
        <button
          onClick={() => alert("此功能尚未實作，請聯繫客服協助。")}
          className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-full text-red-700 bg-white ring-1 ring-red-200 shadow-sm hover:bg-red-50 transition-colors"
        >
          刪除帳號
        </button>
      </div>
    </div>
  );
}
