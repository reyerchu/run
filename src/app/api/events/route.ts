import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeEventStatus } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const region = searchParams.get("region");
  const month = searchParams.get("month");
  const distance = searchParams.get("distance");
  const status = searchParams.get("status"); // This will filter on computed status
  const q = searchParams.get("q");
  const featured = searchParams.get("featured");

  const where: Record<string, unknown> = {};

  if (region) where.region = region;
  if (featured === "true") where.featured = true;

  if (month) {
    const year = new Date().getFullYear();
    const m = parseInt(month);
    where.date = {
      gte: new Date(year, m - 1, 1),
      lt: new Date(year, m, 1),
    };
  }

  if (distance) {
    where.distances = { contains: distance };
  }

  if (q) {
    where.OR = [
      { name: { contains: q } },
      { city: { contains: q } },
      { description: { contains: q } },
    ];
  }

  const events = await prisma.event.findMany({
    where,
    orderBy: { date: "asc" },
    take: 200,
  });

  // Compute real-time status based on dates
  const enriched = events.map((e) => ({
    ...e,
    status: computeEventStatus({
      date: e.date,
      registrationEnd: e.registrationEnd,
      registrationStart: e.registrationStart,
      status: e.status,
    }),
  }));

  // Filter by computed status (post-query)
  const filtered = status
    ? enriched.filter((e) => e.status === status)
    : enriched;

  return NextResponse.json(filtered);
}
