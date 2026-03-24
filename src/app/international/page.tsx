import { prisma } from "@/lib/prisma";
import { EventCard } from "@/components/EventCard";
import { FilterBar } from "@/components/FilterBar";
import { computeEventStatus } from "@/lib/utils";
import { Suspense } from "react";
import { Search } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "國際賽事 | Runner Will Guide",
};

async function EventList({ searchParams }: { searchParams: Record<string, string> }) {
  const where: Record<string, unknown> = { region: "international" };

  if (searchParams.month) {
    const year = new Date().getFullYear();
    const m = parseInt(searchParams.month);
    where.date = { gte: new Date(year, m - 1, 1), lt: new Date(year, m, 1) };
  }
  if (searchParams.distance) where.distances = { contains: searchParams.distance };
  if (searchParams.q) {
    where.OR = [
      { name: { contains: searchParams.q } },
      { city: { contains: searchParams.q } },
    ];
  }

  let events = await prisma.event.findMany({
    where,
    orderBy: { date: "asc" },
    take: 200,
  });

  const enriched = events.map((e) => ({ ...e, status: computeEventStatus(e) }));
  events = searchParams.status
    ? enriched.filter((e) => e.status === searchParams.status)
    : enriched;

  if (events.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <div className="w-12 h-12 rounded-2xl bg-gray-100 ring-1 ring-inset ring-gray-950/5 flex items-center justify-center mx-auto mb-4">
          <Search className="h-6 w-6 text-gray-400" />
        </div>
        <p>沒有找到符合條件的賽事</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.id} event={{ ...event, date: event.date.toISOString(), registrationStart: event.registrationStart?.toISOString(), registrationEnd: event.registrationEnd?.toISOString() }} />
      ))}
    </div>
  );
}

export default async function InternationalPage(props: { searchParams: Promise<Record<string, string>> }) {
  const searchParams = await props.searchParams;

  return (
    <section className="section-padding">
      <div className="container-narrow">
        <div className="mb-8">
          <p className="font-mono uppercase tracking-wider text-xs text-gray-600 mb-2">
            INTERNATIONAL EVENTS
          </p>
          <h1>
            <span className="font-semibold text-gray-950 text-3xl tracking-tight">國際賽事.</span>
            <span className="font-medium text-gray-600 text-base ml-2">
              探索世界各地馬拉松賽事，開展您的國際跑步之旅
            </span>
          </h1>
        </div>

        <div className="mb-8">
          <Suspense>
            <FilterBar />
          </Suspense>
        </div>

        <EventList searchParams={searchParams} />
      </div>
    </section>
  );
}
