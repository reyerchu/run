import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // 基本驗證
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "請填寫所有必要欄位" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "密碼長度至少需要 6 個字符" },
        { status: 400 }
      );
    }

    // 檢查 email 是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "此電子郵件已被註冊" },
        { status: 400 }
      );
    }

    // 加密密碼
    const hashedPassword = await bcrypt.hash(password, 12);

    // 創建用戶
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { message: "註冊成功", user },
      { status: 201 }
    );
  } catch (error) {
    console.error("註冊錯誤:", error);
    return NextResponse.json(
      { message: "內部伺服器錯誤" },
      { status: 500 }
    );
  }
}