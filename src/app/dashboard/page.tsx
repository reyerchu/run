"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Stats {
  totalRaces: number;
  totalDistance: number;
  personalBests: {
    distance: string;
    time: string;
    eventName: string;
  }[];
  recentRaces: {
    id: string;
    eventName: string;
    date: string;
    distance: string;
    finishTime: string | null;
  }[];
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetchStats();
    }
  }, [session]);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/dashboard/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("獲取統計資料失敗:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white overflow-hidden shadow rounded-lg animate-pulse">
              <div className="p-5">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          歡迎回來，{session?.user?.name}！
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          這是您的跑步統計總覽
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-md bg-emerald-500 text-white">
                  🏃‍♂️
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    完賽次數
                  </dt>
                  <dd className="text-3xl font-bold text-gray-900">
                    {stats?.totalRaces || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-md bg-blue-500 text-white">
                  📏
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    總距離
                  </dt>
                  <dd className="text-3xl font-bold text-gray-900">
                    {stats?.totalDistance.toFixed(1) || 0}
                    <span className="text-sm font-normal text-gray-500 ml-1">km</span>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-md bg-yellow-500 text-white">
                  🏆
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    個人最佳紀錄
                  </dt>
                  <dd className="text-lg font-bold text-gray-900">
                    {stats?.personalBests?.length || 0} 項
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent races and personal bests */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent races */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                最近比賽
              </h3>
              <Link
                href="/dashboard/records"
                className="text-sm text-emerald-600 hover:text-emerald-500"
              >
                查看全部
              </Link>
            </div>
            
            {stats?.recentRaces && stats.recentRaces.length > 0 ? (
              <div className="space-y-3">
                {stats.recentRaces.map((race) => (
                  <div key={race.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{race.eventName}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(race.date).toLocaleDateString('zh-TW')} · {race.distance}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {race.finishTime || "未記錄"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 text-sm">還沒有比賽紀錄</p>
                <Link
                  href="/dashboard/records/new"
                  className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
                >
                  新增第一筆紀錄
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Personal bests */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              個人最佳紀錄
            </h3>
            
            {stats?.personalBests && stats.personalBests.length > 0 ? (
              <div className="space-y-3">
                {stats.personalBests.map((pb, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{pb.distance}</p>
                      <p className="text-xs text-gray-500">{pb.eventName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-emerald-600">{pb.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 text-sm">還沒有個人最佳紀錄</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            快速操作
          </h3>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/dashboard/records/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
            >
              ➕ 新增跑步紀錄
            </Link>
            <Link
              href="/events"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              🔍 探索賽事
            </Link>
            <Link
              href="/dashboard/profile"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              ⚙️ 設定檔案
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}