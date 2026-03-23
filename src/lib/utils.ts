import { differenceInDays, format, parseISO } from "date-fns";
import { zhTW } from "date-fns/locale";

export function formatDate(date: string | Date) {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "yyyy/MM/dd (EEE)", { locale: zhTW });
}

export function daysUntil(date: string | Date): number {
  const d = typeof date === "string" ? parseISO(date) : date;
  return differenceInDays(d, new Date());
}

export function getStatusLabel(status: string): { label: string; color: string } {
  switch (status) {
    case "open":
      return { label: "報名中", color: "#22c55e" };
    case "upcoming":
      return { label: "即將開放", color: "#3b82f6" };
    case "closed":
      return { label: "報名截止", color: "#f97316" };
    case "full":
      return { label: "已額滿", color: "#ef4444" };
    case "completed":
      return { label: "已完賽", color: "#9ca3af" };
    case "expected":
      return { label: "預計舉辦", color: "#f59e0b" };
    default:
      return { label: status, color: "#6b7280" };
  }
}

/**
 * 根據賽事日期與報名截止日動態計算顯示狀態
 * 優先使用此函式，而非 DB 中的靜態 status
 */
export function computeEventStatus(event: {
  date: string | Date;
  registrationEnd?: string | Date | null;
  registrationStart?: string | Date | null;
  status?: string;
}): string {
  const now = new Date();
  const raceDate = typeof event.date === "string" ? parseISO(event.date) : event.date;

  // 比賽日已過 → 已完賽
  if (raceDate < now) return "completed";

  // 有報名截止日且已過 → 報名截止
  if (event.registrationEnd) {
    const regEnd = typeof event.registrationEnd === "string" ? parseISO(event.registrationEnd) : event.registrationEnd;
    if (regEnd < now) return "closed";
  }

  // 有報名開始日且已開始 → 報名中
  if (event.registrationStart) {
    const regStart = typeof event.registrationStart === "string" ? parseISO(event.registrationStart) : event.registrationStart;
    if (regStart <= now) return "open";
  }

  // 保留原始狀態（expected, full 等）
  if (event.status === "expected" || event.status === "full") return event.status;

  return "upcoming";
}

export function formatEstimatedDate(estimatedMonth: number | null, date: string | Date): string {
  if (estimatedMonth) {
    const d = typeof date === "string" ? parseISO(date) : date;
    const year = d.getFullYear();
    return `預計 ${year} 年 ${estimatedMonth} 月`;
  }
  return formatDate(date);
}

export function parseDistances(distances: string): string[] {
  try {
    return JSON.parse(distances);
  } catch {
    return [distances];
  }
}

export function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}
