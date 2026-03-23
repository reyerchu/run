import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EventCard } from "@/components/EventCard";
import { computeEventStatus } from "@/lib/utils";
import { Activity } from "lucide-react";

export const dynamic = "force-dynamic";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function enrichEvents<T extends { date: Date; registrationEnd?: Date | null; registrationStart?: Date | null; status: string }>(events: T[]) {
  return events.map((e) => ({
    ...e,
    status: computeEventStatus(e),
  }));
}

async function getStats() {
  const allEvents = await prisma.event.findMany();
  const enriched = enrichEvents(allEvents);
  const total = enriched.length;
  const taiwan = enriched.filter((e) => e.region === "taiwan").length;
  const international = enriched.filter((e) => e.region === "international").length;
  const open = enriched.filter((e) => e.status === "open").length;
  const completed = enriched.filter((e) => e.status === "completed").length;
  return { total, taiwan, international, open, completed };
}

async function getUpcomingEvents() {
  return prisma.event.findMany({
    where: { date: { gte: new Date() } },
    orderBy: { date: "asc" },
    take: 6,
  });
}

async function getClosingSoonEvents() {
  const now = new Date();
  const twoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  return prisma.event.findMany({
    where: {
      status: "open",
      registrationEnd: { gte: now, lte: twoWeeks },
    },
    orderBy: { registrationEnd: "asc" },
    take: 4,
  });
}

export default async function HomePage() {
  const [stats, upcoming, closingSoon] = await Promise.all([
    getStats(),
    getUpcomingEvents(),
    getClosingSoonEvents(),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background image */}
        <img
          src="/hero-marathon.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover scale-[1.02]"
          style={{ filter: "blur(2px) saturate(1.1)" }}
        />
        <div className="absolute inset-0 bg-gray-900/55" />
        <div className="container-narrow relative py-28 md:py-40" style={{ textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}>
          <div className="flex items-start gap-16">
            {/* Left: 3/5 width - Title + Slogan */}
            <div className="w-3/5">
              <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight drop-shadow-lg">
                Runner Will Guide
              </h1>
              <p className="mt-4 text-lg md:text-xl text-gray-200/90 leading-relaxed text-pretty">
                Runner will, your guide.
              </p>
              <p className="mt-1 text-base text-gray-300/80">
                為每位跑者找到下一場賽事
              </p>
            </div>
            {/* Right: 2/5 width - Description & CTAs */}
            <div className="w-2/5">
              <p className="text-lg text-gray-200 leading-relaxed max-w-[40ch] text-pretty">
                一站式跑者賽事平台，探索台灣及國際馬拉松、查詢報名資訊、記錄你的跑步旅程。
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <Link
                  href="/taiwan"
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-full bg-emerald-500 text-white ring-1 ring-emerald-500/10 shadow-sm hover:bg-emerald-400 transition-all"
                >
                  台灣賽事
                </Link>
                <Link
                  href="/international"
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-full ring-1 ring-white/40 text-white/90 hover:bg-white hover:text-gray-900 transition-all"
                >
                  國際賽事
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-950/[2.5%] ring-1 ring-inset ring-gray-950/5">
        <div className="container-narrow py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: stats.total, label: "總賽事數", href: "" },
            { value: stats.taiwan, label: "台灣賽事", href: "/taiwan" },
            { value: stats.international, label: "國際賽事", href: "/international" },
            { value: stats.open, label: "可報名", href: "/open" },
          ].map((s) =>
            s.href ? (
              <Link key={s.label} href={s.href} className="group block hover:opacity-80 transition-opacity">
                <div className="text-3xl font-bold text-emerald-600 group-hover:text-emerald-500 tracking-tight">{s.value}</div>
                <div className="mt-1 text-sm text-gray-500 group-hover:text-emerald-600 leading-7">{s.label}</div>
              </Link>
            ) : (
              <div key={s.label}>
                <div className="text-3xl font-bold text-emerald-600 tracking-tight">{s.value}</div>
                <div className="mt-1 text-sm text-gray-500 leading-7">{s.label}</div>
              </div>
            )
          )}
        </div>
      </section>

      {/* Closing Soon */}
      {closingSoon.length > 0 && (
        <section className="section-padding">
          <div className="container-narrow">
            <div className="mb-8">
              <p className="font-mono uppercase tracking-wider text-xs text-gray-600 mb-2">
                REGISTRATION CLOSING SOON
              </p>
              <h2>
                <span className="font-semibold text-gray-950 text-2xl tracking-tight">報名即將截止.</span>
                <span className="font-medium text-gray-600 text-base ml-2">
                  抓住最後機會，立即報名這些即將截止的精彩賽事
                </span>
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {closingSoon.map((event) => (
                <EventCard key={event.id} event={{ ...event, date: event.date.toISOString(), registrationStart: event.registrationStart?.toISOString(), registrationEnd: event.registrationEnd?.toISOString() }} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming */}
      <section className="section-padding bg-gray-950/[2.5%] ring-1 ring-inset ring-gray-950/5">
        <div className="container-narrow">
          <div className="flex items-start justify-between mb-8">
            <div>
              <p className="font-mono uppercase tracking-wider text-xs text-gray-600 mb-2">
                UPCOMING EVENTS
              </p>
              <h2>
                <span className="font-semibold text-gray-950 text-2xl tracking-tight">近期賽事.</span>
                <span className="font-medium text-gray-600 text-base ml-2">
                  探索即將到來的馬拉松賽事，提前規劃你的跑步行程
                </span>
              </h2>
            </div>
            <Link href="/taiwan" className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-full text-emerald-600 hover:text-emerald-500 ring-1 ring-emerald-600/20 hover:bg-emerald-50 transition-all mt-6">
              查看全部
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 ring-1 ring-inset ring-gray-950/5 flex items-center justify-center mx-auto mb-4">
                <Activity className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm leading-7">目前尚無賽事資料，資料收集中...</p>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              {upcoming.map((event) => (
                <EventCard key={event.id} event={{ ...event, date: event.date.toISOString(), registrationStart: event.registrationStart?.toISOString(), registrationEnd: event.registrationEnd?.toISOString() }} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
