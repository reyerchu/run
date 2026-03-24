import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: 檢查當前用戶是否已收藏
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ favorited: false, count: 0 });
  }

  const [favorite, count] = await Promise.all([
    prisma.favorite.findUnique({
      where: { eventId_userId: { eventId: id, userId: session.user.id } },
    }),
    prisma.favorite.count({ where: { eventId: id } }),
  ]);

  return NextResponse.json({ favorited: !!favorite, count });
}

// POST: 切換收藏狀態
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "請先登入" }, { status: 401 });
  }

  const existing = await prisma.favorite.findUnique({
    where: { eventId_userId: { eventId: id, userId: session.user.id } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
  } else {
    await prisma.favorite.create({
      data: { eventId: id, userId: session.user.id },
    });
  }

  const count = await prisma.favorite.count({ where: { eventId: id } });

  return NextResponse.json({ favorited: !existing, count });
}
