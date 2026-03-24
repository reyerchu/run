"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Activity, Route, Trophy, PenLine, Compass, User } from "lucide-react";

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
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white ring-1 ring-gray-950/10 shadow-sm rounded-2xl animate-pulse p-6">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono uppercase tracking-wider text-xs text-gray-500 mb-2">Dashboard</p>
          <h1 className="text-3xl font-bold text-gray-950 tracking-tight">
            歡迎回來，{session?.user?.name}
          </h1>
          <p className="mt-2 text-sm text-gray-500 leading-7 max-w-[45ch]">
            這是您的跑步統計總覽，記錄每一步的成長。
          </p>
        </div>
        <Link
          href="/dashboard/records/new"
          className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium rounded-full text-white bg-emerald-600 shadow-sm ring-1 ring-emerald-600/10 hover:bg-emerald-500 transition-colors"
        >
          新增紀錄
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="bg-white ring-1 ring-gray-950/10 shadow-sm rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 ring-1 ring-inset ring-emerald-500/10 flex items-center justify-center text-lg">
              <Activity className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-950 tracking-tight">
            {stats?.totalRaces || 0}
          </p>
          <p className="text-sm text-gray-500 mt-1">完賽次數</p>
        </div>

        <div className="bg-white ring-1 ring-gray-950/10 shadow-sm rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 ring-1 ring-inset ring-blue-500/10 flex items-center justify-center text-lg">
              <Route className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-950 tracking-tight">
            {stats?.totalDistance.toFixed(1) || 0}
            <span className="text-base font-normal text-gray-400 ml-1">km</span>
          </p>
          <p className="text-sm text-gray-500 mt-1">總距離</p>
        </div>

        <div className="bg-white ring-1 ring-gray-950/10 shadow-sm rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 ring-1 ring-inset ring-amber-500/10 flex items-center justify-center text-lg">
              <Trophy className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-950 tracking-tight">
            {stats?.personalBests?.length || 0}
            <span className="text-base font-normal text-gray-400 ml-1">項</span>
          </p>
          <p className="text-sm text-gray-500 mt-1">個人最佳紀錄</p>
        </div>
      </div>

      {/* Recent races and personal bests */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent races */}
        <div className="bg-white ring-1 ring-gray-950/10 shadow-sm rounded-2xl overflow-hidden">
          <div className="px-6 py-5 flex items-center justify-between border-b border-gray-950/5">
            <h3 className="text-base font-semibold text-gray-950 tracking-tight">最近比賽</h3>
            <Link
              href="/dashboard/records"
              className="text-sm font-medium text-emerald-600 hover:text-emerald-500 transition-colors"
            >
              查看全部 →
            </Link>
          </div>
          <div className="px-6 py-2">
            {stats?.recentRaces && stats.recentRaces.length > 0 ? (
              <div className="divide-y divide-gray-950/5">
                {stats.recentRaces.map((race) => (
                  <div key={race.id} className="flex justify-between items-center py-3.5">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{race.eventName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(race.date).toLocaleDateString('zh-TW')} · {race.distance}
                      </p>
                    </div>
                    <p className="text-sm font-mono font-medium text-gray-900">
                      {race.finishTime || "—"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 ring-1 ring-inset ring-gray-950/5 flex items-center justify-center mx-auto mb-4">
                  <Activity className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 mb-4 text-pretty">還沒有比賽紀錄</p>
                <Link
                  href="/dashboard/records/new"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-full text-white bg-emerald-600 shadow-sm ring-1 ring-emerald-600/10 hover:bg-emerald-500 transition-colors"
                >
                  新增第一筆紀錄
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Personal bests */}
        <div className="bg-white ring-1 ring-gray-950/10 shadow-sm rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-950/5">
            <h3 className="text-base font-semibold text-gray-950 tracking-tight">個人最佳紀錄</h3>
          </div>
          <div className="px-6 py-2">
            {stats?.personalBests && stats.personalBests.length > 0 ? (
              <div className="divide-y divide-gray-950/5">
                {stats.personalBests.map((pb, index) => (
                  <div key={index} className="flex justify-between items-center py-3.5">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{pb.distance}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{pb.eventName}</p>
                    </div>
                    <p className="text-sm font-mono font-semibold text-emerald-600">{pb.time}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 ring-1 ring-inset ring-gray-950/5 flex items-center justify-center mx-auto mb-4">
                  <Trophy className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 text-pretty">完成第一場比賽後，您的紀錄會顯示在這裡</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick actions — mobile only CTA */}
      <div className="sm:hidden">
        <Link
          href="/dashboard/records/new"
          className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium rounded-full text-white bg-emerald-600 shadow-sm ring-1 ring-emerald-600/10 hover:bg-emerald-500 transition-colors"
        >
          新增跑步紀錄
        </Link>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/dashboard/records/new" className="group bg-gray-950/[2.5%] ring-1 ring-inset ring-gray-950/5 rounded-2xl p-5 hover:bg-gray-950/[4%] transition-colors">
          <PenLine className="h-5 w-5 text-gray-600 mb-2" />
          <p className="text-sm font-semibold text-gray-950 tracking-tight group-hover:text-emerald-600 transition-colors">新增跑步紀錄</p>
          <p className="text-xs text-gray-500 mt-1 leading-5">記錄您的完賽成績</p>
        </Link>
        <Link href="/taiwan" className="group bg-gray-950/[2.5%] ring-1 ring-inset ring-gray-950/5 rounded-2xl p-5 hover:bg-gray-950/[4%] transition-colors">
          <Compass className="h-5 w-5 text-gray-600 mb-2" />
          <p className="text-sm font-semibold text-gray-950 tracking-tight group-hover:text-emerald-600 transition-colors">探索賽事</p>
          <p className="text-xs text-gray-500 mt-1 leading-5">找到您的下一場比賽</p>
        </Link>
        <Link href="/dashboard/profile" className="group bg-gray-950/[2.5%] ring-1 ring-inset ring-gray-950/5 rounded-2xl p-5 hover:bg-gray-950/[4%] transition-colors">
          <User className="h-5 w-5 text-gray-600 mb-2" />
          <p className="text-sm font-semibold text-gray-950 tracking-tight group-hover:text-emerald-600 transition-colors">個人檔案</p>
          <p className="text-xs text-gray-500 mt-1 leading-5">更新您的跑者資訊</p>
        </Link>
      </div>
    </div>
  );
}
