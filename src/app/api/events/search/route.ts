import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  const events = await prisma.event.findMany({
    where: {
      name: { contains: q },
    },
    orderBy: { date: "desc" },
    take: 10,
    select: {
      id: true,
      name: true,
      date: true,
      city: true,
      country: true,
      distances: true,
    },
  });

  return NextResponse.json(events);
}
