import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      photos: { include: { user: { select: { name: true, image: true } } }, orderBy: { createdAt: "desc" } },
      reviews: { include: { user: { select: { name: true, image: true } } }, orderBy: { createdAt: "desc" } },
      _count: { select: { favorites: true } },
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(event);
}
