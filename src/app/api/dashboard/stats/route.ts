import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授權" }, { status: 401 });
    }

    // 獲取所有跑步紀錄
    const raceLogs = await prisma.raceLog.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
      include: {
        event: {
          select: { name: true }
        }
      }
    });

    // 計算統計數據
    const totalRaces = raceLogs.length;
    let totalDistance = 0;

    // 計算總距離
    raceLogs.forEach(log => {
      if (log.distanceKm) {
        totalDistance += log.distanceKm;
      } else {
        // 如果沒有精確距離，從距離字符串推估
        const distance = log.distance.toLowerCase();
        if (distance.includes('42') || distance.includes('marathon')) {
          totalDistance += 42.2;
        } else if (distance.includes('21') || distance.includes('half')) {
          totalDistance += 21.1;
        } else if (distance.includes('10')) {
          totalDistance += 10;
        } else if (distance.includes('5')) {
          totalDistance += 5;
        }
      }
    });

    // 獲取最近5場比賽
    const recentRaces = raceLogs.slice(0, 5).map(log => ({
      id: log.id,
      eventName: log.eventName,
      date: log.date.toISOString(),
      distance: log.distance,
      finishTime: log.finishTime,
    }));

    // 計算個人最佳紀錄（依距離分組）
    const personalBests = new Map();
    
    raceLogs.forEach(log => {
      if (log.finishSecs && log.finishTime) {
        const distance = log.distance;
        const existing = personalBests.get(distance);
        
        if (!existing || log.finishSecs < existing.finishSecs) {
          personalBests.set(distance, {
            distance,
            time: log.finishTime,
            finishSecs: log.finishSecs,
            eventName: log.eventName,
          });
        }
      }
    });

    const personalBestsArray = Array.from(personalBests.values())
      .sort((a, b) => a.finishSecs - b.finishSecs)
      .slice(0, 5)
      .map(pb => ({
        distance: pb.distance,
        time: pb.time,
        eventName: pb.eventName,
      }));

    return NextResponse.json({
      totalRaces,
      totalDistance,
      personalBests: personalBestsArray,
      recentRaces,
    });
  } catch (error) {
    console.error("獲取統計資料錯誤:", error);
    return NextResponse.json(
      { error: "內部伺服器錯誤" },
      { status: 500 }
    );
  }
}