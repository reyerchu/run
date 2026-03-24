import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const photos = await prisma.photo.findMany({
    where: { eventId: id },
    include: { user: { select: { name: true, image: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(photos);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登入" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;
    const caption = (formData.get("caption") as string) || "";

    if (!file) {
      return NextResponse.json({ error: "未選擇圖片" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "只支援 JPG、PNG、WebP 格式" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "檔案大小不能超過 10MB" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${crypto.randomUUID()}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "photos");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);

    const imageUrl = `/api/uploads/photos/${filename}`;

    const photo = await prisma.photo.create({
      data: {
        eventId: id,
        userId: session.user.id,
        imageUrl,
        caption: caption.trim() || null,
      },
      include: { user: { select: { name: true, image: true } } },
    });

    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    console.error("照片上傳錯誤:", error);
    return NextResponse.json({ error: "上傳失敗" }, { status: 500 });
  }
}
