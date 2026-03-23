import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登入" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("cert") as File | null;
    if (!file) {
      return NextResponse.json({ error: "未選擇檔案" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "只支援 JPG、PNG、WebP 或 PDF 格式" }, { status: 400 });
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "檔案大小不能超過 5MB" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${crypto.randomUUID()}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "certs");
    const filepath = path.join(uploadDir, filename);

    await writeFile(filepath, buffer);

    const url = `/api/uploads/certs/${filename}`;
    return NextResponse.json({ url });
  } catch (error) {
    console.error("上傳錯誤:", error);
    return NextResponse.json({ error: "上傳失敗" }, { status: 500 });
  }
}
