"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Activity } from "lucide-react";

interface RaceLog {
  id: string;
  eventName: string;
  date: string;
  distance: string;
  distanceKm: number | null;
  finishTime: string | null;
  pace: string | null;
  rank: number | null;
  totalRunner: number | null;
  category: string | null;
  note: string | null;
  photoUrl: string | null;
  event: { id: string; name: string } | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function RecordsPage() {
  const { data: session } = useSession();
  const [records, setRecords] = useState<RaceLog[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (session?.user) {
      fetchRecords(currentPage);
    }
  }, [session, currentPage]);

  const fetchRecords = async (page: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/race-logs?page=${page}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        setRecords(data.raceLogs);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("獲取紀錄失敗:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, eventName: string) => {
    if (!confirm(`確定要刪除「${eventName}」的紀錄嗎？`)) return;

    try {
      const response = await fetch(`/api/race-logs/${id}`, { method: "DELETE" });
      if (response.ok) {
        fetchRecords(currentPage);
      } else {
        alert("刪除失敗，請稍後再試");
      }
    } catch (error) {
      console.error("刪除錯誤:", error);
      alert("刪除失敗，請稍後再試");
    }
  };

  if (loading && records.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded-full w-28 animate-pulse"></div>
        </div>
        <div className="bg-white ring-1 ring-gray-950/10 shadow-sm rounded-2xl p-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse mb-3 last:mb-0"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono uppercase tracking-wider text-xs text-gray-500 mb-2">Records</p>
          <h1 className="text-3xl font-bold text-gray-950 tracking-tight">跑步紀錄</h1>
          <p className="mt-2 text-sm text-gray-500 leading-7">
            {pagination?.total ? `共 ${pagination.total} 筆紀錄` : "管理您的跑步紀錄"}
          </p>
        </div>
        <Link
          href="/dashboard/records/new"
          className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-full text-white bg-emerald-600 shadow-sm ring-1 ring-emerald-600/10 hover:bg-emerald-500 transition-colors"
        >
          新增紀錄
        </Link>
      </div>

      {/* Records */}
      {records.length > 0 ? (
        <div className="bg-white ring-1 ring-gray-950/10 shadow-sm rounded-2xl overflow-hidden">
          {/* Desktop table */}
          <div className="hidden sm:block">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-950/5">
                  <th className="px-6 py-3.5 text-left text-xs font-mono font-medium text-gray-500 uppercase tracking-wider">賽事名稱</th>
                  <th className="px-6 py-3.5 text-left text-xs font-mono font-medium text-gray-500 uppercase tracking-wider">日期</th>
                  <th className="px-6 py-3.5 text-left text-xs font-mono font-medium text-gray-500 uppercase tracking-wider">距離</th>
                  <th className="px-6 py-3.5 text-left text-xs font-mono font-medium text-gray-500 uppercase tracking-wider">完賽時間</th>
                  <th className="px-6 py-3.5 text-left text-xs font-mono font-medium text-gray-500 uppercase tracking-wider">名次</th>
                  <th className="relative px-6 py-3.5"><span className="sr-only">操作</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-950/5">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-950/[2.5%] transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{record.eventName}</p>
                      {record.category && (
                        <p className="text-xs text-gray-500 mt-0.5">{record.category}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(record.date).toLocaleDateString('zh-TW')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{record.distance}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-mono text-gray-900">{record.finishTime || "—"}</p>
                      {record.pace && (
                        <p className="text-xs text-gray-500 mt-0.5">{record.pace}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {record.rank && record.totalRunner
                        ? `${record.rank}/${record.totalRunner}`
                        : record.rank || "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3">
                        <Link
                          href={`/dashboard/records/${record.id}/edit`}
                          className="text-sm text-emerald-600 hover:text-emerald-500 font-medium transition-colors"
                        >
                          編輯
                        </Link>
                        <button
                          onClick={() => handleDelete(record.id, record.eventName)}
                          className="text-sm text-red-600 hover:text-red-500 font-medium transition-colors"
                        >
                          刪除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden divide-y divide-gray-950/5">
            {records.map((record) => (
              <div key={record.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm font-semibold text-gray-950 tracking-tight">
                    {record.eventName}
                  </h3>
                  <div className="flex gap-3 ml-2">
                    <Link
                      href={`/dashboard/records/${record.id}/edit`}
                      className="text-xs text-emerald-600 font-medium"
                    >
                      編輯
                    </Link>
                    <button
                      onClick={() => handleDelete(record.id, record.eventName)}
                      className="text-xs text-red-600 font-medium"
                    >
                      刪除
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                  <span>{new Date(record.date).toLocaleDateString('zh-TW')}</span>
                  <span>{record.distance}</span>
                  <span className="font-mono text-gray-900">{record.finishTime || "—"}</span>
                  {record.rank && <span>#{record.rank}</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="px-6 py-4 border-t border-gray-950/5 flex items-center justify-between">
              <p className="text-sm text-gray-500 hidden sm:block">
                第 {(currentPage - 1) * 10 + 1}–{Math.min(currentPage * 10, pagination.total)} 筆，共 {pagination.total} 筆
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm font-medium rounded-full ring-1 ring-gray-950/10 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ‹ 上一頁
                </button>
                <button
                  onClick={() => currentPage < pagination.pages && setCurrentPage(currentPage + 1)}
                  disabled={currentPage === pagination.pages}
                  className="px-3 py-1.5 text-sm font-medium rounded-full ring-1 ring-gray-950/10 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  下一頁 ›
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty state */
        <div className="bg-white ring-1 ring-gray-950/10 shadow-sm rounded-2xl text-center py-16">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 ring-1 ring-inset ring-gray-950/5 flex items-center justify-center mx-auto mb-4">
            <Activity className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-950 mb-2 tracking-tight">還沒有跑步紀錄</h3>
          <p className="text-sm text-gray-500 mb-6 text-pretty max-w-[35ch] mx-auto leading-7">
            開始記錄您的跑步旅程吧！每一場比賽都值得被記住。
          </p>
          <Link
            href="/dashboard/records/new"
            className="inline-flex items-center px-5 py-2.5 text-sm font-medium rounded-full text-white bg-emerald-600 shadow-sm ring-1 ring-emerald-600/10 hover:bg-emerald-500 transition-colors"
          >
            新增第一筆紀錄
          </Link>
        </div>
      )}
    </div>
  );
}
