import { prisma } from "@/lib/prisma";
import { EventCard } from "@/components/EventCard";
import { FilterBar } from "@/components/FilterBar";
import { computeEventStatus } from "@/lib/utils";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "國際賽事 | Marathon Board",
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
        <p className="text-4xl mb-4">🔍</p>
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
          <h1 className="text-3xl font-bold">🌍 國際賽事</h1>
          <p className="mt-2 text-gray-500">探索世界各地馬拉松賽事</p>
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
