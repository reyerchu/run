"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Calendar, MapPin, Hash, Users, Award, FileText, ExternalLink, PenLine, ArrowLeft } from "lucide-react";

interface RaceLog {
  id: string;
  eventName: string;
  eventId: string | null;
  date: string;
  distance: string;
  distanceKm: number | null;
  finishTime: string | null;
  bibNumber: string | null;
  pace: string | null;
  rank: number | null;
  totalRunner: number | null;
  category: string | null;
  note: string | null;
  certUrl: string | null;
  certImage: string | null;
  photoUrl: string | null;
  createdAt: string;
  event: { id: string; name: string; city?: string; country?: string } | null;
}

export default function RecordDetailPage() {
  const router = useRouter();
  const params = useParams();
  const recordId = params.id as string;
  const { data: session } = useSession();
  const [record, setRecord] = useState<RaceLog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) fetchRecord();
  }, [session]);

  const fetchRecord = async () => {
    try {
      const res = await fetch(`/api/race-logs/${recordId}`);
      if (res.ok) {
        setRecord(await res.json());
      } else {
        router.push("/dashboard/records");
      }
    } catch (err) {
      console.error("獲取紀錄失敗:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!session) return null;

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        <div className="bg-white ring-1 ring-gray-950/10 shadow-sm rounded-2xl p-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-6 bg-gray-100 rounded-lg animate-pulse mb-4"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!record) return null;

  const dateStr = new Date(record.date).toLocaleDateString("zh-TW", {
    year: "numeric", month: "long", day: "numeric", weekday: "long",
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back + Header */}
      <div>
        <button onClick={() => router.push("/dashboard/records")}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-3">
          <ArrowLeft className="h-4 w-4" /> 返回紀錄列表
        </button>
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono uppercase tracking-wider text-xs text-gray-500 mb-2">Race Record</p>
            <h1 className="text-3xl font-bold text-gray-950 tracking-tight">{record.eventName}</h1>
            <p className="mt-2 text-sm text-gray-500 flex items-center gap-1.5">
              <Calendar className="h-4 w-4" /> {dateStr}
            </p>
          </div>
          <Link href={`/dashboard/records/${record.id}/edit`}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full text-gray-700 bg-white ring-1 ring-gray-950/10 shadow-sm hover:bg-gray-50 transition-colors">
            <PenLine className="h-4 w-4" /> 編輯
          </Link>
        </div>
      </div>

      {/* Main Info Card */}
      <div className="bg-white ring-1 ring-gray-950/10 shadow-sm rounded-2xl overflow-hidden">
        {/* Distance highlight */}
        <div className="px-6 py-5 bg-emerald-50/50 border-b border-gray-950/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">距離</p>
              <p className="text-2xl font-bold text-gray-950 tracking-tight mt-0.5">
                {record.distance}
                {record.distanceKm && (
                  <span className="text-base font-normal text-gray-400 ml-2">{record.distanceKm} km</span>
                )}
              </p>
            </div>
            {record.finishTime && (
              <div className="text-right">
                <p className="text-sm text-gray-500">完賽時間</p>
                <p className="text-2xl font-bold font-mono text-emerald-600 tracking-tight mt-0.5">{record.finishTime}</p>
              </div>
            )}
          </div>
        </div>

        {/* Details grid */}
        <div className="px-6 divide-y divide-gray-950/5">
          {record.bibNumber && (
            <div className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-sm text-gray-500">
                <Hash className="h-4 w-4" /> 競賽編號
              </div>
              <p className="text-sm font-mono font-medium text-gray-900">{record.bibNumber}</p>
            </div>
          )}

          {record.rank && (
            <div className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-sm text-gray-500">
                <Award className="h-4 w-4" /> 名次
              </div>
              <p className="text-sm font-medium text-gray-900">
                {record.rank}{record.totalRunner ? ` / ${record.totalRunner}` : ""}
              </p>
            </div>
          )}

          {record.category && (
            <div className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-sm text-gray-500">
                <Users className="h-4 w-4" /> 分組
              </div>
              <p className="text-sm font-medium text-gray-900">{record.category}</p>
            </div>
          )}

          {record.event && (
            <div className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-sm text-gray-500">
                <MapPin className="h-4 w-4" /> 賽事
              </div>
              <Link href={`/event/${record.event.id}`}
                className="text-sm font-medium text-emerald-600 hover:text-emerald-500 transition-colors">
                查看賽事詳情 →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Note */}
      {record.note && (
        <div className="bg-white ring-1 ring-gray-950/10 shadow-sm rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-950/5">
            <h3 className="text-base font-semibold text-gray-950 tracking-tight flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-400" /> 心得備註
            </h3>
          </div>
          <div className="px-6 py-5">
            <p className="text-sm text-gray-700 leading-7 whitespace-pre-wrap">{record.note}</p>
          </div>
        </div>
      )}

      {/* Certificate */}
      {(record.certUrl || record.certImage) && (
        <div className="bg-white ring-1 ring-gray-950/10 shadow-sm rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-950/5">
            <h3 className="text-base font-semibold text-gray-950 tracking-tight flex items-center gap-2">
              <Award className="h-4 w-4 text-gray-400" /> 完賽證書
            </h3>
          </div>
          <div className="px-6 py-5 space-y-4">
            {record.certImage && (
              <a href={record.certImage} target="_blank" rel="noopener noreferrer" className="block">
                <img
                  src={record.certImage}
                  alt="完賽證書"
                  className="max-w-full rounded-xl ring-1 ring-gray-950/10 shadow-sm hover:shadow-md transition-shadow"
                />
              </a>
            )}
            {record.certUrl && (
              <a href={record.certUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-500 transition-colors">
                <ExternalLink className="h-4 w-4" /> 查看線上證書
              </a>
            )}
          </div>
        </div>
      )}

      {/* Meta */}
      <p className="text-xs text-gray-400 text-center">
        建立於 {new Date(record.createdAt).toLocaleString("zh-TW")}
      </p>
    </div>
  );
}
