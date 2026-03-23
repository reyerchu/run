"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

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
    if (!confirm(`確定要刪除「${eventName}」的紀錄嗎？`)) {
      return;
    }

    try {
      const response = await fetch(`/api/race-logs/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // 重新獲取當前頁面的資料
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
          <h1 className="text-2xl font-bold text-gray-900">跑步紀錄</h1>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">跑步紀錄</h1>
          <p className="mt-1 text-sm text-gray-600">
            {pagination?.total ? `共 ${pagination.total} 筆紀錄` : "管理您的跑步紀錄"}
          </p>
        </div>
        <Link
          href="/dashboard/records/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700"
        >
          ➕ 新增紀錄
        </Link>
      </div>

      {/* Records list */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {records.length > 0 ? (
          <div>
            {/* Desktop table */}
            <div className="hidden sm:block">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      賽事名稱
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      日期
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      距離
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      完賽時間
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      名次
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">操作</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {records.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {record.eventName}
                        </div>
                        {record.category && (
                          <div className="text-sm text-gray-500">{record.category}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(record.date).toLocaleDateString('zh-TW')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.distance}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {record.finishTime || "未記錄"}
                        </div>
                        {record.pace && (
                          <div className="text-sm text-gray-500">{record.pace}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.rank && record.totalRunner
                          ? `${record.rank}/${record.totalRunner}`
                          : record.rank || "未記錄"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            href={`/dashboard/records/${record.id}/edit`}
                            className="text-emerald-600 hover:text-emerald-900"
                          >
                            編輯
                          </Link>
                          <button
                            onClick={() => handleDelete(record.id, record.eventName)}
                            className="text-red-600 hover:text-red-900"
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
            <div className="sm:hidden">
              <div className="space-y-4 p-4">
                {records.map((record) => (
                  <div key={record.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        {record.eventName}
                      </h3>
                      <div className="flex space-x-2 ml-2">
                        <Link
                          href={`/dashboard/records/${record.id}/edit`}
                          className="text-emerald-600 hover:text-emerald-900 text-sm"
                        >
                          編輯
                        </Link>
                        <button
                          onClick={() => handleDelete(record.id, record.eventName)}
                          className="text-red-600 hover:text-red-900 text-sm"
                        >
                          刪除
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">日期：</span>
                        <span className="text-gray-900">
                          {new Date(record.date).toLocaleDateString('zh-TW')}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">距離：</span>
                        <span className="text-gray-900">{record.distance}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">完賽時間：</span>
                        <span className="text-gray-900">{record.finishTime || "未記錄"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">名次：</span>
                        <span className="text-gray-900">
                          {record.rank && record.totalRunner
                            ? `${record.rank}/${record.totalRunner}`
                            : record.rank || "未記錄"}
                        </span>
                      </div>
                    </div>

                    {record.note && (
                      <div className="mt-3 text-sm">
                        <span className="text-gray-500">備註：</span>
                        <span className="text-gray-900">{record.note}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    上一頁
                  </button>
                  <button
                    onClick={() => currentPage < pagination.pages && setCurrentPage(currentPage + 1)}
                    disabled={currentPage === pagination.pages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    下一頁
                  </button>
                </div>
                
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      顯示第 <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> 到{" "}
                      <span className="font-medium">
                        {Math.min(currentPage * 10, pagination.total)}
                      </span>{" "}
                      筆，共 <span className="font-medium">{pagination.total}</span> 筆
                    </p>
                  </div>
                  
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        上一頁
                      </button>
                      
                      {/* Page numbers */}
                      {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === pageNum
                                ? "z-10 bg-emerald-50 border-emerald-500 text-emerald-600"
                                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => currentPage < pagination.pages && setCurrentPage(currentPage + 1)}
                        disabled={currentPage === pagination.pages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        下一頁
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏃‍♂️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              還沒有跑步紀錄
            </h3>
            <p className="text-gray-500 mb-6">
              開始記錄您的跑步旅程吧！
            </p>
            <Link
              href="/dashboard/records/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700"
            >
              ➕ 新增第一筆紀錄
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}