import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - 獲取單一跑步紀錄
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授權" }, { status: 401 });
    }

    const raceLog = await prisma.raceLog.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        event: {
          select: { id: true, name: true }
        }
      }
    });

    if (!raceLog) {
      return NextResponse.json({ error: "紀錄不存在" }, { status: 404 });
    }

    return NextResponse.json(raceLog);
  } catch (error) {
    console.error("獲取跑步紀錄錯誤:", error);
    return NextResponse.json(
      { error: "內部伺服器錯誤" },
      { status: 500 }
    );
  }
}

// PUT - 更新跑步紀錄
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授權" }, { status: 401 });
    }

    // 檢查紀錄是否存在且屬於當前用戶
    const existingRecord = await prisma.raceLog.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingRecord) {
      return NextResponse.json({ error: "紀錄不存在" }, { status: 404 });
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

    const raceLog = await prisma.raceLog.update({
      where: { id: params.id },
      data: {
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
      },
      include: {
        event: {
          select: { id: true, name: true }
        }
      }
    });

    return NextResponse.json(raceLog);
  } catch (error) {
    console.error("更新跑步紀錄錯誤:", error);
    return NextResponse.json(
      { error: "內部伺服器錯誤" },
      { status: 500 }
    );
  }
}

// DELETE - 刪除跑步紀錄
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授權" }, { status: 401 });
    }

    // 檢查紀錄是否存在且屬於當前用戶
    const existingRecord = await prisma.raceLog.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingRecord) {
      return NextResponse.json({ error: "紀錄不存在" }, { status: 404 });
    }

    await prisma.raceLog.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "紀錄已刪除" });
  } catch (error) {
    console.error("刪除跑步紀錄錯誤:", error);
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