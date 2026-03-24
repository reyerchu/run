import { prisma } from "@/lib/prisma";
import { EventCard } from "@/components/EventCard";
import { computeEventStatus } from "@/lib/utils";
import { Inbox } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "可報名賽事 | Runner Will Guide",
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
          <p className="font-mono uppercase tracking-wider text-xs text-gray-600 mb-2">
            OPEN REGISTRATION
          </p>
          <h1>
            <span className="font-semibold text-gray-950 text-3xl tracking-tight">可報名賽事.</span>
            <span className="font-medium text-gray-600 text-base ml-2">
              目前開放報名中的賽事，共 {openEvents.length} 場賽事等您來挑戰
            </span>
          </h1>
        </div>

        {openEvents.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 ring-1 ring-inset ring-gray-950/5 flex items-center justify-center mx-auto mb-4">
              <Inbox className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm leading-7">目前沒有開放報名的賽事</p>
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
