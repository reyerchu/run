import { prisma } from "@/lib/prisma";
import { EventCard } from "@/components/EventCard";
import { computeEventStatus } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "可報名賽事 | Marathon Board",
};

export default async function OpenPage() {
  const allEvents = await prisma.event.findMany({
    where: { date: { gte: new Date() } },
    orderBy: { date: "asc" },
  });

  const openEvents = allEvents
    .map((e) => ({ ...e, status: computeEventStatus(e) }))
    .filter((e) => e.status === "open");

  return (
    <section className="section-padding">
      <div className="container-narrow">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">✏️ 可報名賽事</h1>
          <p className="mt-2 text-gray-500">
            目前開放報名中的賽事，共 {openEvents.length} 場
          </p>
        </div>

        {openEvents.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-4">📭</p>
            <p>目前沒有開放報名的賽事</p>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {openEvents.map((event) => (
              <EventCard
                key={event.id}
                event={{
                  ...event,
                  date: event.date.toISOString(),
                  registrationStart: event.registrationStart?.toISOString(),
                  registrationEnd: event.registrationEnd?.toISOString(),
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
