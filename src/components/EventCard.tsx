"use client";

import Link from "next/link";
import { formatDate, formatEstimatedDate, daysUntil, getStatusLabel, computeEventStatus, parseDistances, cn } from "@/lib/utils";
import { MapPin, Calendar, Clock } from "lucide-react";

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
        "group rounded-xl p-4 sm:p-5 card-hover relative overflow-hidden shadow-sm",
        isExpected
          ? "bg-amber-950/[2.5%] ring-1 ring-amber-500/20"
          : isCompleted
            ? "bg-gray-950/[2.5%] ring-1 ring-gray-950/10 opacity-65"
            : computedStatus === "open"
              ? "bg-emerald-950/[2.5%] ring-1 ring-emerald-500/20 shadow-emerald-100/50"
              : "bg-gray-950/[2.5%] ring-1 ring-gray-950/10"
      )}>
        {/* Header */}
        <div>
          <div className="flex items-center justify-between gap-3 mb-2">
            <p className="text-sm text-gray-500 flex items-center">
              <MapPin className="h-3.5 w-3.5 text-gray-400 mr-1" />{event.city}{event.country ? `, ${event.country}` : ""}
            </p>
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold text-white shrink-0" style={{ backgroundColor: color }}>{label}</span>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-1">
            {event.name}
          </h3>
        </div>

        {/* Distances */}
        <div className="mt-2 sm:mt-4 flex flex-wrap gap-1 sm:gap-2">
          {distances.map((d) => (
            <span key={d} className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-white ring-1 ring-gray-950/10 text-gray-700 shadow-sm">{d}</span>
          ))}
        </div>

        {/* Dates */}
        <div className="mt-2 sm:mt-4 space-y-1 sm:space-y-1.5 text-xs sm:text-sm text-gray-600 leading-7">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-gray-400" />
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
              <Clock className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-gray-400">報名時間：尚未公布</span>
            </div>
          ) : event.registrationEnd && (
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-gray-400" />
              <span>報名截止：{formatDate(event.registrationEnd)}</span>
              {daysToRegEnd !== null && daysToRegEnd > 0 && (
                <span className="text-orange-500 font-medium">({daysToRegEnd} 天)</span>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        {event.description && (
          <p className="mt-3 text-sm text-gray-400 line-clamp-2 leading-7 text-pretty max-w-[45ch]">{event.description}</p>
        )}

        {/* Quick links */}
        {(event.websiteUrl || event.registrationUrl) && (
          <div className="mt-4 flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
            {event.websiteUrl && (
              <a
                href={event.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-full bg-white ring-1 ring-gray-950/10 text-gray-600 hover:ring-emerald-500/20 hover:text-emerald-700 hover:bg-emerald-50 transition-colors shadow-sm"
                onClick={(e) => e.stopPropagation()}
              >
                官方網站
              </a>
            )}
            {event.registrationUrl && !isExpected && !isCompleted && computedStatus !== "closed" && (
              <a
                href={event.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-full bg-emerald-500 text-white ring-1 ring-emerald-500/10 shadow-sm hover:bg-emerald-400 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                立即報名
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
