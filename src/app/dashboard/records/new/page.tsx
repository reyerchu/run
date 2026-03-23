"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function NewRecordPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    eventName: "",
    date: "",
    distance: "",
    distanceKm: "",
    finishTime: "",
    pace: "",
    rank: "",
    totalRunner: "",
    category: "",
    note: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const calculatePace = (time: string, distance: string) => {
    if (!time || !distance) return "";
    
    // 解析時間 (HH:MM:SS 或 MM:SS)
    const timeParts = time.split(":").map(p => parseInt(p));
    let totalSeconds = 0;
    
    if (timeParts.length === 3) {
      totalSeconds = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
    } else if (timeParts.length === 2) {
      totalSeconds = timeParts[0] * 60 + timeParts[1];
    } else {
      return "";
    }

    // 解析距離
    let distanceKm = 0;
    const distanceLower = distance.toLowerCase();
    if (distanceLower.includes('42') || distanceLower.includes('marathon')) {
      distanceKm = 42.2;
    } else if (distanceLower.includes('21') || distanceLower.includes('half')) {
      distanceKm = 21.1;
    } else if (distanceLower.includes('10')) {
      distanceKm = 10;
    } else if (distanceLower.includes('5')) {
      distanceKm = 5;
    } else {
      const match = distance.match(/(\d+\.?\d*)/);
      if (match) {
        distanceKm = parseFloat(match[1]);
      }
    }

    if (distanceKm === 0) return "";

    // 計算配速 (分:秒/公里)
    const paceSeconds = totalSeconds / distanceKm;
    const paceMinutes = Math.floor(paceSeconds / 60);
    const remainingSeconds = Math.floor(paceSeconds % 60);
    
    return `${paceMinutes}:${remainingSeconds.toString().padStart(2, '0')}/km`;
  };

  // 當完賽時間或距離改變時，自動計算配速
  const handleTimeOrDistanceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      
      if (name === "finishTime" || name === "distance") {
        const time = name === "finishTime" ? value : prev.finishTime;
        const distance = name === "distance" ? value : prev.distance;
        updated.pace = calculatePace(time, distance);
      }
      
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/race-logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/dashboard/records");
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || "新增失敗，請稍後再試");
      }
    } catch (error) {
      console.error("提交錯誤:", error);
      alert("新增失敗，請檢查網路連線");
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">新增跑步紀錄</h1>
        <p className="mt-1 text-sm text-gray-600">
          記錄您的跑步成績和心得
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-6">
            {/* 賽事名稱 */}
            <div>
              <label htmlFor="eventName" className="block text-sm font-medium text-gray-700">
                賽事名稱 *
              </label>
              <input
                type="text"
                name="eventName"
                id="eventName"
                required
                value={formData.eventName}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                placeholder="例如：2024 台北馬拉松"
              />
            </div>

            {/* 比賽日期 */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                比賽日期 *
              </label>
              <input
                type="date"
                name="date"
                id="date"
                required
                value={formData.date}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
              />
            </div>

            {/* 距離 */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="distance" className="block text-sm font-medium text-gray-700">
                  距離 *
                </label>
                <select
                  name="distance"
                  id="distance"
                  required
                  value={formData.distance}
                  onChange={handleTimeOrDistanceChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                >
                  <option value="">請選擇距離</option>
                  <option value="42K">全程馬拉松 (42K)</option>
                  <option value="21K">半程馬拉松 (21K)</option>
                  <option value="10K">10K</option>
                  <option value="5K">5K</option>
                  <option value="3K">3K</option>
                  <option value="其他">其他</option>
                </select>
              </div>

              <div>
                <label htmlFor="distanceKm" className="block text-sm font-medium text-gray-700">
                  精確距離 (公里)
                </label>
                <input
                  type="number"
                  name="distanceKm"
                  id="distanceKm"
                  step="0.1"
                  value={formData.distanceKm}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                  placeholder="例如：42.2"
                />
              </div>
            </div>

            {/* 完賽時間與配速 */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="finishTime" className="block text-sm font-medium text-gray-700">
                  完賽時間
                </label>
                <input
                  type="text"
                  name="finishTime"
                  id="finishTime"
                  value={formData.finishTime}
                  onChange={handleTimeOrDistanceChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                  placeholder="例如：3:45:22 或 45:30"
                />
                <p className="mt-1 text-xs text-gray-500">格式：時:分:秒 或 分:秒</p>
              </div>

              <div>
                <label htmlFor="pace" className="block text-sm font-medium text-gray-700">
                  配速
                </label>
                <input
                  type="text"
                  name="pace"
                  id="pace"
                  value={formData.pace}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-gray-50"
                  placeholder="自動計算或手動輸入"
                  readOnly={formData.finishTime && formData.distance ? true : false}
                />
              </div>
            </div>

            {/* 名次 */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label htmlFor="rank" className="block text-sm font-medium text-gray-700">
                  名次
                </label>
                <input
                  type="number"
                  name="rank"
                  id="rank"
                  value={formData.rank}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                  placeholder="例如：15"
                />
              </div>

              <div>
                <label htmlFor="totalRunner" className="block text-sm font-medium text-gray-700">
                  總參賽人數
                </label>
                <input
                  type="number"
                  name="totalRunner"
                  id="totalRunner"
                  value={formData.totalRunner}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                  placeholder="例如：500"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  分組
                </label>
                <input
                  type="text"
                  name="category"
                  id="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                  placeholder="例如：M30-39"
                />
              </div>
            </div>

            {/* 心得備註 */}
            <div>
              <label htmlFor="note" className="block text-sm font-medium text-gray-700">
                心得備註
              </label>
              <textarea
                name="note"
                id="note"
                rows={4}
                value={formData.note}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                placeholder="記錄您的跑步心得、賽道狀況或任何想法..."
              />
            </div>
          </div>
        </div>

        {/* Form actions */}
        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-emerald-600 text-base font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "儲存中..." : "儲存紀錄"}
          </button>
          
          <button
            type="button"
            onClick={() => router.back()}
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:mt-0 sm:w-auto sm:text-sm"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
}