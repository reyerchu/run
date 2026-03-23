"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Search, Upload, ExternalLink, X } from "lucide-react";

interface EventSuggestion {
  id: string;
  name: string;
  date: string;
  city: string;
  country: string | null;
  distances: string;
}

export default function EditRecordPage() {
  const router = useRouter();
  const params = useParams();
  const recordId = params.id as string;
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    eventName: "",
    eventId: "",
    date: "",
    distance: "",
    distanceKm: "",
    finishTime: "",
    bibNumber: "",
    rank: "",
    totalRunner: "",
    category: "",
    note: "",
    certUrl: "",
    certImage: "",
  });
  const [uploading, setUploading] = useState(false);
  const [certPreview, setCertPreview] = useState<string | null>(null);

  // Autocomplete
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<EventSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventSuggestion | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Fetch existing record
  useEffect(() => {
    if (session?.user) {
      fetchRecord();
    }
  }, [session]);

  const fetchRecord = async () => {
    try {
      const res = await fetch(`/api/race-logs/${recordId}`);
      if (res.ok) {
        const data = await res.json();
        const dateStr = new Date(data.date).toISOString().split("T")[0];
        setFormData({
          eventName: data.eventName || "",
          eventId: data.eventId || "",
          date: dateStr,
          distance: data.distance || "",
          distanceKm: data.distanceKm?.toString() || "",
          finishTime: data.finishTime || "",
          bibNumber: data.bibNumber || "",
          rank: data.rank?.toString() || "",
          totalRunner: data.totalRunner?.toString() || "",
          category: data.category || "",
          note: data.note || "",
          certUrl: data.certUrl || "",
          certImage: data.certImage || "",
        });
        setQuery(data.eventName || "");
        if (data.certImage) setCertPreview(data.certImage);
      } else {
        alert("找不到此紀錄");
        router.push("/dashboard/records");
      }
    } catch (err) {
      console.error("獲取紀錄失敗:", err);
    } finally {
      setFetching(false);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchEvents = async (q: string) => {
    if (q.length < 2) { setSuggestions([]); return; }
    try {
      const res = await fetch(`/api/events/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data);
        setShowSuggestions(data.length > 0);
      }
    } catch (err) { console.error("搜尋失敗:", err); }
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setSelectedEvent(null);
    setFormData(prev => ({ ...prev, eventName: val, eventId: "" }));
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchEvents(val), 300);
  };

  const selectEvent = (event: EventSuggestion) => {
    setSelectedEvent(event);
    setQuery(event.name);
    setShowSuggestions(false);
    let defaultDistance = "";
    const d = event.distances;
    if (d.includes("42")) defaultDistance = "42K";
    else if (d.includes("21")) defaultDistance = "21K";
    else if (d.includes("10")) defaultDistance = "10K";
    else if (d.includes("5")) defaultDistance = "5K";
    else if (d.includes("3")) defaultDistance = "3K";
    const dateStr = new Date(event.date).toISOString().split("T")[0];
    setFormData(prev => ({
      ...prev,
      eventName: event.name,
      eventId: event.id,
      date: dateStr,
      distance: defaultDistance || prev.distance,
    }));
  };

  const distanceKmMap: Record<string, string> = {
    "42K": "42.195", "21K": "21.0975", "10K": "10", "6K": "6", "5K": "5", "3K": "3",
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "distance" && distanceKmMap[value]) {
      setFormData(prev => ({ ...prev, distance: value, distanceKm: distanceKmMap[value] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCertUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("cert", file);
      const res = await fetch("/api/race-logs/cert-upload", { method: "POST", body: fd });
      if (res.ok) {
        const { url } = await res.json();
        setFormData(prev => ({ ...prev, certImage: url }));
        setCertPreview(url);
      } else {
        const data = await res.json();
        alert(data.error || "上傳失敗");
      }
    } catch (err) {
      console.error("上傳錯誤:", err);
      alert("上傳失敗");
    } finally {
      setUploading(false);
    }
  };

  const removeCertImage = () => {
    setFormData(prev => ({ ...prev, certImage: "" }));
    setCertPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`/api/race-logs/${recordId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        router.push("/dashboard/records");
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || "更新失敗，請稍後再試");
      }
    } catch (error) {
      console.error("提交錯誤:", error);
      alert("更新失敗，請檢查網路連線");
    } finally {
      setLoading(false);
    }
  };

  if (!session) return null;

  if (fetching) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        <div className="bg-white ring-1 ring-gray-950/10 shadow-sm rounded-2xl p-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="space-y-2 mb-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-100 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <p className="font-mono uppercase tracking-wider text-xs text-gray-500 mb-2">Edit Record</p>
        <h1 className="text-3xl font-bold text-gray-950 tracking-tight">編輯跑步紀錄</h1>
        <p className="mt-2 text-sm text-gray-500 leading-7">修改您的跑步成績和心得</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white ring-1 ring-gray-950/10 shadow-sm rounded-2xl">
        <div className="px-6 py-6">
          <div className="space-y-5">
            {/* 賽事名稱 */}
            <div className="relative">
              <label htmlFor="eventName" className="block text-sm font-medium text-gray-700 mb-1.5">賽事名稱 *</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  ref={inputRef}
                  type="text"
                  id="eventName"
                  required
                  value={query}
                  onChange={handleQueryChange}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  className="block w-full rounded-xl bg-white pl-10 pr-4 py-2.5 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-950/10 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="輸入關鍵字搜尋賽事..."
                  autoComplete="off"
                />
              </div>
              {selectedEvent && (
                <p className="mt-1.5 text-xs text-emerald-600">
                  ✓ 已選擇：{selectedEvent.city}{selectedEvent.country ? `, ${selectedEvent.country}` : ""} · {new Date(selectedEvent.date).toLocaleDateString("zh-TW")}
                </p>
              )}
              {showSuggestions && (
                <div ref={suggestionsRef} className="absolute z-50 mt-1 w-full bg-white rounded-xl ring-1 ring-gray-950/10 shadow-lg overflow-hidden max-h-64 overflow-y-auto">
                  {suggestions.map(event => (
                    <button key={event.id} type="button" onClick={() => selectEvent(event)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-950/[2.5%] transition-colors border-b border-gray-950/5 last:border-0">
                      <p className="text-sm font-medium text-gray-900">{event.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {event.city}{event.country ? `, ${event.country}` : ""} · {new Date(event.date).toLocaleDateString("zh-TW")} · {event.distances}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 比賽日期 */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1.5">比賽日期 *</label>
              <input type="date" name="date" id="date" required value={formData.date} onChange={handleInputChange}
                className="block w-full rounded-xl bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-950/10 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>

            {/* 距離 */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="distance" className="block text-sm font-medium text-gray-700 mb-1.5">距離 *</label>
                <select name="distance" id="distance" required value={formData.distance} onChange={handleInputChange}
                  className="block w-full rounded-xl bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-950/10 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="">請選擇距離</option>
                  <option value="42K">全程馬拉松 (42K)</option>
                  <option value="21K">半程馬拉松 (21K)</option>
                  <option value="10K">10K</option>
                  <option value="6K">6K</option>
                  <option value="5K">5K</option>
                  <option value="3K">3K</option>
                  <option value="其他">其他</option>
                </select>
              </div>
              <div>
                <label htmlFor="distanceKm" className="block text-sm font-medium text-gray-700 mb-1.5">精確距離 (公里) *</label>
                <input type="number" name="distanceKm" required id="distanceKm" step="0.1" value={formData.distanceKm} onChange={handleInputChange}
                  className="block w-full rounded-xl bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-950/10 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="例如：42.2" />
              </div>
            </div>

            {/* 完賽時間與競賽編號 */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="finishTime" className="block text-sm font-medium text-gray-700 mb-1.5">完賽時間</label>
                <input type="text" name="finishTime" id="finishTime" value={formData.finishTime} onChange={handleInputChange}
                  className="block w-full rounded-xl bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-950/10 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="例如：3:45:22 或 45:30" />
                <p className="mt-1 text-xs text-gray-400">格式：時:分:秒 或 分:秒</p>
              </div>
              <div>
                <label htmlFor="bibNumber" className="block text-sm font-medium text-gray-700 mb-1.5">競賽編號</label>
                <input type="text" name="bibNumber" id="bibNumber" value={formData.bibNumber} onChange={handleInputChange}
                  className="block w-full rounded-xl bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-950/10 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="例如：1234" />
              </div>
            </div>

            {/* 名次 */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div>
                <label htmlFor="rank" className="block text-sm font-medium text-gray-700 mb-1.5">名次</label>
                <input type="number" name="rank" id="rank" value={formData.rank} onChange={handleInputChange}
                  className="block w-full rounded-xl bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-950/10 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="15" />
              </div>
              <div>
                <label htmlFor="totalRunner" className="block text-sm font-medium text-gray-700 mb-1.5">總參賽人數</label>
                <input type="number" name="totalRunner" id="totalRunner" value={formData.totalRunner} onChange={handleInputChange}
                  className="block w-full rounded-xl bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-950/10 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="500" />
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1.5">分組</label>
                <input type="text" name="category" id="category" value={formData.category} onChange={handleInputChange}
                  className="block w-full rounded-xl bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-950/10 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="M30-39" />
              </div>
            </div>

            {/* 證書 */}
            <div className="space-y-4">
              <p className="text-sm font-medium text-gray-700">完賽證書</p>
              <div>
                <label htmlFor="certUrl" className="block text-xs text-gray-500 mb-1.5">證書連結（線上證書網址）</label>
                <div className="relative">
                  <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <input type="url" name="certUrl" id="certUrl" value={formData.certUrl} onChange={handleInputChange}
                    className="block w-full rounded-xl bg-white pl-10 pr-4 py-2.5 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-950/10 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="https://..." />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">上傳證書圖片（JPG、PNG、WebP 或 PDF，最大 5MB）</label>
                {certPreview ? (
                  <div className="relative inline-block">
                    <img src={certPreview} alt="證書預覽" className="h-32 rounded-xl ring-1 ring-gray-950/10 object-cover" />
                    <button type="button" onClick={removeCertImage}
                      className="absolute -top-2 -right-2 p-1 bg-white rounded-full ring-1 ring-gray-950/10 shadow-sm hover:bg-red-50 transition-colors">
                      <X className="h-3.5 w-3.5 text-gray-500" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 w-full py-6 rounded-xl border-2 border-dashed border-gray-300 hover:border-emerald-400 hover:bg-emerald-50/30 transition-colors cursor-pointer">
                    <Upload className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-500">{uploading ? "上傳中..." : "點擊上傳證書"}</span>
                    <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={handleCertUpload} className="hidden" disabled={uploading} />
                  </label>
                )}
              </div>
            </div>

            {/* 心得備註 */}
            <div>
              <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1.5">心得備註</label>
              <textarea name="note" id="note" rows={4} value={formData.note} onChange={handleInputChange}
                className="block w-full rounded-xl bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-950/10 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="記錄您的跑步心得、賽道狀況或任何想法..." />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-950/5 flex flex-row-reverse gap-3">
          <button type="submit" disabled={loading}
            className="inline-flex items-center px-5 py-2.5 text-sm font-medium rounded-full text-white bg-emerald-600 shadow-sm ring-1 ring-emerald-600/10 hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "儲存中..." : "儲存變更"}
          </button>
          <button type="button" onClick={() => router.back()}
            className="inline-flex items-center px-5 py-2.5 text-sm font-medium rounded-full text-gray-700 bg-white ring-1 ring-gray-950/10 shadow-sm hover:bg-gray-50 transition-colors">
            取消
          </button>
        </div>
      </form>
    </div>
  );
}
