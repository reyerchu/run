"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface CalEvent {
  id: string;
  name: string;
  region: string;
  date: string;
  status: string;
  city: string;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth()); // 0-indexed

  useEffect(() => {
    fetch(`/api/events?month=${month + 1}`)
      .then((r) => r.json())
      .then(setEvents);
  }, [month, year]);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const days = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstDay + 1;
    if (day < 1 || day > daysInMonth) return null;
    return day;
  });

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((e) => e.date.startsWith(dateStr));
  };

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  };

  const monthNames = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

  return (
    <section className="section-padding">
      <div className="container-narrow">
        <div className="mb-8">
          <p className="font-mono uppercase tracking-wider text-xs text-gray-600 mb-2">
            EVENT CALENDAR
          </p>
          <h1>
            <span className="font-semibold text-gray-950 text-3xl tracking-tight">賽事行事曆.</span>
            <span className="font-medium text-gray-600 text-base ml-2">
              以月份視圖瀏覽所有賽事，輕鬆規劃你的跑步行程
            </span>
          </h1>
        </div>

        {/* Month nav */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth} className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-full bg-white ring-1 ring-gray-950/10 shadow-sm hover:bg-gray-50 transition-colors">←</button>
          <h2 className="text-xl font-semibold tracking-tight">{year} 年 {monthNames[month]}</h2>
          <button onClick={nextMonth} className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-full bg-white ring-1 ring-gray-950/10 shadow-sm hover:bg-gray-50 transition-colors">→</button>
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-xl overflow-hidden ring-1 ring-gray-950/10 shadow-sm">
          {["日", "一", "二", "三", "四", "五", "六"].map((d) => (
            <div key={d} className="bg-gray-50 py-3 text-center text-sm font-medium text-gray-500">{d}</div>
          ))}
          {days.map((day, i) => {
            const dayEvents = day ? getEventsForDay(day) : [];
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

            return (
              <div
                key={i}
                className={cn(
                  "bg-white min-h-[80px] md:min-h-[100px] p-1.5",
                  !day && "bg-gray-50"
                )}
              >
                {day && (
                  <>
                    <div className={cn(
                      "text-sm mb-1",
                      isToday && "w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold"
                    )}>
                      {day}
                    </div>
                    {dayEvents.slice(0, 3).map((e) => (
                      <Link
                        key={e.id}
                        href={`/event/${e.id}`}
                        className={cn(
                          "block text-xs truncate rounded px-1 py-0.5 mb-0.5 hover:opacity-80",
                          e.region === "taiwan"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-blue-50 text-blue-700"
                        )}
                      >
                        {e.name}
                      </Link>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-gray-400">+{dayEvents.length - 3}</div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex gap-4 text-xs text-gray-500 leading-7">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-50 ring-1 ring-emerald-200" />
            台灣賽事
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-50 ring-1 ring-blue-200" />
            國際賽事
          </div>
        </div>
      </div>
    </section>
  );
}
