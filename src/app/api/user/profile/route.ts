import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - 獲取用戶資料
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授權" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "用戶不存在" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("獲取用戶資料錯誤:", error);
    return NextResponse.json(
      { error: "內部伺服器錯誤" },
      { status: 500 }
    );
  }
}

// PUT - 更新用戶資料
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授權" }, { status: 401 });
    }

    const { name, bio } = await request.json();

    // 基本驗證
    if (name && name.trim().length === 0) {
      return NextResponse.json(
        { error: "姓名不能為空" },
        { status: 400 }
      );
    }

    if (name && name.length > 50) {
      return NextResponse.json(
        { error: "姓名長度不能超過 50 個字符" },
        { status: 400 }
      );
    }

    if (bio && bio.length > 500) {
      return NextResponse.json(
        { error: "個人簡介長度不能超過 500 個字符" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name?.trim() || null,
        bio: bio?.trim() || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("更新用戶資料錯誤:", error);
    return NextResponse.json(
      { error: "內部伺服器錯誤" },
      { status: 500 }
    );
  }
}