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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
        
        // 更新 session 中的 user.name
        await update({
          ...session,
          user: {
            ...session?.user,
            name: updatedProfile.name,
          },
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
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-10 bg-gray-100 rounded"></div>
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
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">個人檔案</h1>
        <p className="mt-1 text-sm text-gray-600">
          管理您的帳號資訊和偏好設定
        </p>
      </div>

      {/* Profile info card */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center space-x-6 mb-6">
            {profile.image ? (
              <img
                className="h-20 w-20 rounded-full object-cover"
                src={profile.image}
                alt=""
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-emerald-600 flex items-center justify-center text-white text-2xl font-medium">
                {profile.name?.[0] || profile.email?.[0] || "U"}
              </div>
            )}
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {profile.name || "未設定姓名"}
              </h3>
              <p className="text-sm text-gray-500">{profile.email}</p>
              <p className="text-xs text-gray-400">
                加入日期：{new Date(profile.createdAt).toLocaleDateString('zh-TW')}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 姓名 */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                姓名
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                placeholder="輸入您的姓名"
              />
            </div>

            {/* Email (唯讀) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                電子郵件
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={profile.email || ""}
                disabled
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                電子郵件無法修改。如需變更，請聯繫客服。
              </p>
            </div>

            {/* 個人簡介 */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                個人簡介
              </label>
              <textarea
                name="bio"
                id="bio"
                rows={4}
                value={formData.bio}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                placeholder="介紹一下自己的跑步經歷或目標..."
              />
            </div>

            {/* Submit button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "儲存中..." : "儲存變更"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Account info */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">帳號資訊</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
              <div>
                <p className="text-sm font-medium text-gray-900">帳號 ID</p>
                <p className="text-xs text-gray-500">{profile.id}</p>
              </div>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
              <div>
                <p className="text-sm font-medium text-gray-900">帳號創建時間</p>
                <p className="text-xs text-gray-500">
                  {new Date(profile.createdAt).toLocaleString('zh-TW')}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center py-3">
              <div>
                <p className="text-sm font-medium text-gray-900">登入方式</p>
                <p className="text-xs text-gray-500">
                  {profile.image && profile.image.includes('googleusercontent')
                    ? "Google OAuth"
                    : "電子郵件密碼"
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-white shadow rounded-lg border-l-4 border-red-400">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-red-800 mb-2">危險操作</h3>
          <p className="text-sm text-red-600 mb-4">
            這些操作不可逆轉，請謹慎操作。
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => alert("此功能尚未實作，請聯繫客服協助。")}
              className="inline-flex items-center px-3 py-2 border border-red-300 text-sm leading-4 font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              刪除帳號
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}