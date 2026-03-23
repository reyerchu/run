"use client";

import Link from "next/link";
import { formatDate, formatEstimatedDate, daysUntil, getStatusLabel, computeEventStatus, parseDistances, cn } from "@/lib/utils";

interface EventCardProps {
  event: {
    id: string;
    name: string;
    region: string;
    city: string;
    country?: string | null;
    date: string;
    registrationStart?: string | null;
    registrationEnd?: string | null;
    distances: string;
    status: string;
    websiteUrl?: string | null;
    registrationUrl?: string | null;
    description?: string | null;
    isRecurring?: boolean;
    estimatedMonth?: number | null;
    source?: string | null;
    sourceUrl?: string | null;
  };
}

export function EventCard({ event }: EventCardProps) {
  const computedStatus = computeEventStatus(event);
  const { label, color } = getStatusLabel(computedStatus);
  const distances = parseDistances(event.distances);
  const isExpected = computedStatus === "expected";
  const isCompleted = computedStatus === "completed";
  const daysToRace = isExpected ? null : daysUntil(event.date);
  const daysToRegEnd = !isExpected && event.registrationEnd ? daysUntil(event.registrationEnd) : null;

  return (
    <Link href={`/event/${event.id}`} className="block">
      <div className={cn(
        "group rounded-xl border p-4 sm:p-5 card-hover relative overflow-hidden",
        isExpected
          ? "border-amber-300 bg-gradient-to-br from-amber-50 to-orange-100/70"
          : isCompleted
            ? "border-gray-300 bg-gradient-to-br from-gray-100 to-gray-200/80 opacity-65"
            : computedStatus === "open"
              ? "border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-100/60 shadow-emerald-100/50"
              : "border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50/40"
      )}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors truncate">
              {event.name}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              📍 {event.city}{event.country ? `, ${event.country}` : ""}
            </p>
          </div>
          <span className={cn("badge text-white shrink-0", color)}>{label}</span>
        </div>

        {/* Distances */}
        <div className="mt-2 sm:mt-4 flex flex-wrap gap-1 sm:gap-2">
          {distances.map((d) => (
            <span key={d} className="badge bg-white border border-gray-300 text-gray-700 shadow-sm">{d}</span>
          ))}
        </div>

        {/* Dates */}
        <div className="mt-2 sm:mt-4 space-y-1 sm:space-y-1.5 text-xs sm:text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">🗓</span>
            <span>
              {isExpected
                ? formatEstimatedDate(event.estimatedMonth ?? null, event.date)
                : `比賽日：${formatDate(event.date)}`}
            </span>
            {!isExpected && daysToRace !== null && daysToRace > 0 && (
              <span className="text-emerald-600 font-medium">({daysToRace} 天後)</span>
            )}
          </div>
          {isExpected ? (
            <div className="flex items-center gap-2">
              <span className="text-gray-400">✏️</span>
              <span className="text-gray-400">報名時間：尚未公布</span>
            </div>
          ) : event.registrationEnd && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400">✏️</span>
              <span>報名截止：{formatDate(event.registrationEnd)}</span>
              {daysToRegEnd !== null && daysToRegEnd > 0 && (
                <span className="text-orange-500 font-medium">({daysToRegEnd} 天)</span>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        {event.description && (
          <p className="mt-3 text-sm text-gray-400 line-clamp-2">{event.description}</p>
        )}

        {/* Quick links */}
        {(event.websiteUrl || event.registrationUrl) && (
          <div className="mt-4 flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
            {event.websiteUrl && (
              <a
                href={event.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full border border-gray-300/70 bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                🔗 官方網站
              </a>
            )}
            {event.registrationUrl && !isExpected && !isCompleted && computedStatus !== "closed" && (
              <a
                href={event.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-400 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                ✏️ 立即報名
              </a>
            )}
          </div>
        )}

        {/* Source */}
        {event.source && (
          <div className="mt-2 sm:mt-3 text-[10px] sm:text-xs text-gray-400">
            資料來源：{event.sourceUrl ? (
              <a
                href={event.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-600 underline underline-offset-2"
                onClick={(e) => e.stopPropagation()}
              >{event.source}</a>
            ) : event.source}
          </div>
        )}

        {/* Expected disclaimer */}
        {isExpected && (
          <p className="mt-3 text-xs text-amber-600/70 italic">
            依據往年慣例推估，實際時間以主辦單位公告為準
          </p>
        )}
      </div>
    </Link>
  );
}
