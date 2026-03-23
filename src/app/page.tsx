import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EventCard } from "@/components/EventCard";
import { computeEventStatus } from "@/lib/utils";

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
        <div className="container-narrow relative py-28 md:py-40 text-center" style={{ textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}>
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight drop-shadow-lg">
            Marathon Board
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-200 max-w-2xl mx-auto">
            一站式馬拉松賽事資訊平台<br className="sm:hidden" />
            查詢台灣及國際賽事，掌握報名時間
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/taiwan"
              className="rounded-full border border-emerald-400 px-8 py-3 text-sm font-semibold text-emerald-300 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all"
            >
              台灣賽事 →
            </Link>
            <Link
              href="/international"
              className="rounded-full border border-white/40 px-8 py-3 text-sm font-semibold text-white/80 hover:bg-white hover:text-gray-900 hover:border-white transition-all"
            >
              國際賽事 →
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-gray-100 bg-gray-50">
        <div className="container-narrow py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: stats.total, label: "總賽事數", href: "" },
            { value: stats.taiwan, label: "台灣賽事", href: "/taiwan" },
            { value: stats.international, label: "國際賽事", href: "/international" },
            { value: stats.open, label: "可報名", href: "/open" },
          ].map((s) =>
            s.href ? (
              <Link key={s.label} href={s.href} className="group block hover:opacity-80 transition-opacity">
                <div className="text-3xl font-bold text-emerald-600 group-hover:text-emerald-500">{s.value}</div>
                <div className="mt-1 text-sm text-gray-500 group-hover:text-emerald-600">{s.label}</div>
              </Link>
            ) : (
              <div key={s.label}>
                <div className="text-3xl font-bold text-emerald-600">{s.value}</div>
                <div className="mt-1 text-sm text-gray-500">{s.label}</div>
              </div>
            )
          )}
        </div>
      </section>

      {/* Closing Soon */}
      {closingSoon.length > 0 && (
        <section className="section-padding">
          <div className="container-narrow">
            <div className="flex items-center gap-3 mb-8">
              <span className="text-2xl">⏰</span>
              <h2 className="text-2xl font-bold">報名即將截止</h2>
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
      <section className="section-padding bg-gray-50">
        <div className="container-narrow">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏅</span>
              <h2 className="text-2xl font-bold">近期賽事</h2>
            </div>
            <Link href="/taiwan" className="text-sm text-emerald-600 hover:text-emerald-500 font-medium">
              查看全部 →
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-4">🏃‍♂️</p>
              <p>目前尚無賽事資料，資料收集中...</p>
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
