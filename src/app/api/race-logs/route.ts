import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - 獲取跑步紀錄列表
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授權" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const [raceLogs, total] = await Promise.all([
      prisma.raceLog.findMany({
        where: { userId: session.user.id },
        orderBy: { date: "desc" },
        skip,
        take: limit,
        include: {
          event: {
            select: { id: true, name: true }
          }
        }
      }),
      prisma.raceLog.count({
        where: { userId: session.user.id }
      })
    ]);

    return NextResponse.json({
      raceLogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("獲取跑步紀錄錯誤:", error);
    return NextResponse.json(
      { error: "內部伺服器錯誤" },
      { status: 500 }
    );
  }
}

// POST - 新增跑步紀錄
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授權" }, { status: 401 });
    }

    const data = await request.json();
    const {
      eventId,
      eventName,
      date,
      distance,
      distanceKm,
      finishTime,
      pace,
      rank,
      totalRunner,
      category,
      note,
      photoUrl,
      certUrl,
      certImage,
      bibNumber,
    } = data;

    // 基本驗證
    if (!eventName || !date || !distance) {
      return NextResponse.json(
        { error: "請填寫必要欄位：賽事名稱、日期、距離" },
        { status: 400 }
      );
    }

    // 計算完賽秒數（如果有完賽時間）
    let finishSecs = null;
    if (finishTime) {
      finishSecs = parseTimeToSeconds(finishTime);
    }

    const raceLog = await prisma.raceLog.create({
      data: {
        userId: session.user.id,
        eventId: eventId || null,
        eventName,
        date: new Date(date),
        distance,
        distanceKm: distanceKm ? parseFloat(distanceKm) : null,
        finishTime: finishTime || null,
        finishSecs,
        pace: pace || null,
        rank: rank ? parseInt(rank) : null,
        totalRunner: totalRunner ? parseInt(totalRunner) : null,
        category: category || null,
        note: note || null,
        photoUrl: photoUrl || null,
        certUrl: certUrl || null,
        certImage: certImage || null,
        bibNumber: bibNumber || null,
      },
      include: {
        event: {
          select: { id: true, name: true }
        }
      }
    });

    return NextResponse.json(raceLog, { status: 201 });
  } catch (error) {
    console.error("新增跑步紀錄錯誤:", error);
    return NextResponse.json(
      { error: "內部伺服器錯誤" },
      { status: 500 }
    );
  }
}

// 將時間字符串轉換為秒數（如：3:45:22 -> 13522）
function parseTimeToSeconds(timeStr: string): number | null {
  try {
    const parts = timeStr.split(":").map(p => parseInt(p));
    if (parts.length === 3) {
      // HH:MM:SS
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      // MM:SS
      return parts[0] * 60 + parts[1];
    }
    return null;
  } catch {
    return null;
  }
}