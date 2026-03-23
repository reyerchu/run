"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const months = [
  { value: "", label: "全部月份" },
  ...Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: `${i + 1} 月`,
  })),
];

const distances = [
  { value: "", label: "全部距離" },
  { value: "全馬", label: "全馬" },
  { value: "半馬", label: "半馬" },
  { value: "10K", label: "10K" },
  { value: "5K", label: "5K" },
  { value: "超馬", label: "超馬" },
];

const statuses = [
  { value: "", label: "全部狀態" },
  { value: "open", label: "報名中" },
  { value: "upcoming", label: "即將開放" },
  { value: "closed", label: "報名截止" },
  { value: "completed", label: "已完賽" },
  { value: "full", label: "已額滿" },
  { value: "expected", label: "預計舉辦" },
];

export function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`?${params.toString()}`);
  };

  const selectClass = "rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        type="text"
        placeholder="搜尋賽事..."
        defaultValue={searchParams.get("q") || ""}
        onChange={(e) => updateFilter("q", e.target.value)}
        className={cn(selectClass, "w-full sm:w-64")}
      />
      <select
        defaultValue={searchParams.get("month") || ""}
        onChange={(e) => updateFilter("month", e.target.value)}
        className={selectClass}
      >
        {months.map((m) => (
          <option key={m.value} value={m.value}>{m.label}</option>
        ))}
      </select>
      <select
        defaultValue={searchParams.get("distance") || ""}
        onChange={(e) => updateFilter("distance", e.target.value)}
        className={selectClass}
      >
        {distances.map((d) => (
          <option key={d.value} value={d.value}>{d.label}</option>
        ))}
      </select>
      <select
        defaultValue={searchParams.get("status") || ""}
        onChange={(e) => updateFilter("status", e.target.value)}
        className={selectClass}
      >
        {statuses.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
    </div>
  );
}
