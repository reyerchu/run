import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Verified data from scraping each page's #reg tab
const fixes: Record<string, { date: string; city: string; distances?: string; regStart?: string; regEnd?: string }> = {
  "6725": { date: "2026-03-22", city: "台北市", distances: "6K", regStart: "2025-10-13", regEnd: "2025-12-31" },
  "6917": { date: "2026-10-04", city: "台北市", distances: "28K,16K,4K", regStart: "2026-02-07", regEnd: "2026-08-31" },
  "6798": { date: "2026-05-17", city: "台南市", distances: "全馬,半馬,10K,5K", regStart: "2025-11-04", regEnd: "2026-04-17" },
  "6925": { date: "2026-03-28", city: "台北市", distances: "6K", regStart: "2026-02-13", regEnd: "2026-03-25" },
  "6926": { date: "2026-08-15", city: "台南市", distances: "全馬,半馬,10K,5K", regStart: "2026-02-10", regEnd: "2026-07-15" },
  "6892": { date: "2026-05-03", city: "台東縣", distances: "全馬,半馬,10K", regStart: "2026-02-04", regEnd: "2026-03-27" },
  "6852": { date: "2026-06-27", city: "嘉義縣", distances: "15K,10K,5K", regStart: "2026-01-06", regEnd: "2026-05-31" },
  "6839": { date: "2026-05-16", city: "台北市", distances: "全馬,半馬,10K,5K", regStart: "2025-12-10", regEnd: "2026-04-12" },
  "6905": { date: "2026-10-04", city: "台北市", distances: "6K", regStart: "2026-02-01", regEnd: "2026-08-31" },
  "6858": { date: "2026-05-31", city: "台南市", distances: "超半馬25K,12K,5K", regStart: "2026-03-02", regEnd: "2026-04-06" },
  "6808": { date: "2026-04-18", city: "新北市", distances: "健走", regStart: "2025-11-25", regEnd: "2026-04-18" },
  "6923": { date: "2026-06-14", city: "新北市", distances: "越野", regStart: "2026-02-11", regEnd: "2026-04-30" },
  "6827": { date: "2026-03-28", city: "台中市", distances: "健走", regStart: "2025-12-11", regEnd: "2026-03-28" },
  "6949": { date: "2026-05-09", city: "新北市", distances: "8K,5K", regStart: "2026-03-18", regEnd: "2026-04-09" },
  "6906": { date: "2026-05-23", city: "南投縣", distances: "100K,50K", regStart: "2026-01-30", regEnd: "2026-04-11" },
  "6887": { date: "2026-07-04", city: "宜蘭縣", distances: "25K,15K,9K,5K", regStart: "2026-02-10", regEnd: "2026-06-06" },
  "6733": { date: "2025-10-10", city: "台北市", distances: "健走" },
  "6803": { date: "2026-05-16", city: "台北市", distances: "21K,10K,3.5K", regStart: "2025-12-30", regEnd: "2026-04-07" },
  "6891": { date: "2026-05-23", city: "高雄市", distances: "10K,5K,3K", regStart: "2026-02-06", regEnd: "2026-03-31" },
};

async function main() {
  for (const [contentId, fix] of Object.entries(fixes)) {
    const sourceUrl = `https://bao-ming.com/eb/content/${contentId}`;
    const event = await prisma.event.findFirst({ where: { sourceUrl } });
    if (!event) {
      console.log(`❌ Not found: ${contentId}`);
      continue;
    }

    const update: Record<string, unknown> = {
      // Use noon UTC to avoid timezone issues
      date: new Date(fix.date + "T00:00:00+08:00"),
      city: fix.city,
    };
    if (fix.distances) update.distances = fix.distances;
    if (fix.regStart) update.registrationStart = new Date(fix.regStart + "T00:00:00+08:00");
    if (fix.regEnd) update.registrationEnd = new Date(fix.regEnd + "T00:00:00+08:00");

    await prisma.event.update({ where: { id: event.id }, data: update });
    
    const oldDate = event.date.toISOString().slice(0, 10);
    const newDate = fix.date;
    const dateChanged = oldDate !== newDate ? `📅 ${oldDate}→${newDate}` : "";
    const cityChanged = event.city !== fix.city ? `📍 ${event.city}→${fix.city}` : "";
    const distChanged = event.distances !== (fix.distances || event.distances) ? `🏃 ${event.distances}→${fix.distances}` : "";
    
    console.log(`✅ ${contentId} ${event.name} ${[dateChanged, cityChanged, distChanged].filter(Boolean).join(" | ")}`);
  }

  const count = await prisma.event.count();
  console.log(`\n📦 Total events: ${count}`);
  await prisma.$disconnect();
}

main();
