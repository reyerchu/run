import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Events from bao-ming.com (伊貝特報名網) — verified real data
const events = [
  {
    name: "2026 台北星光馬拉松",
    nameEn: "2026 Taipei Starlight Marathon",
    region: "taiwan",
    country: "台灣",
    city: "台北市",
    date: new Date("2026-05-16"),
    registrationStart: new Date("2025-12-10"),
    registrationEnd: new Date("2026-04-12"),
    distances: "全馬,半馬,10K",
    status: "open",
    websiteUrl: "https://bao-ming.com/eb/content/6839",
    registrationUrl: "https://bao-ming.com/eb/content/6839",
    description: "台灣鐵人運動協會主辦，夜間馬拉松體驗台北夜景之美。",
    source: "bao-ming.com",
    sourceUrl: "https://bao-ming.com/eb/content/6839",
    verified: true,
  },
  {
    name: "2026 將軍漁港馬拉松",
    nameEn: "2026 Jiangjun Fishing Port Marathon",
    region: "taiwan",
    country: "台灣",
    city: "台南市",
    date: new Date("2026-05-17"),
    registrationStart: new Date("2025-11-04"),
    registrationEnd: new Date("2026-04-17"),
    distances: "全馬,半馬,10K",
    status: "open",
    websiteUrl: "https://bao-ming.com/eb/content/6798",
    registrationUrl: "https://bao-ming.com/eb/content/6798",
    description: "府城國際超級馬拉松協會主辦，沿台南將軍漁港海岸線跑行。",
    source: "bao-ming.com",
    sourceUrl: "https://bao-ming.com/eb/content/6798",
    verified: true,
  },
  {
    name: "2026 ELLE RUN WITH STYLE",
    region: "taiwan",
    country: "台灣",
    city: "台北市",
    date: new Date("2026-05-16"),
    registrationStart: new Date("2025-12-30"),
    registrationEnd: new Date("2026-04-07"),
    distances: "10K,5K",
    status: "open",
    websiteUrl: "https://bao-ming.com/eb/content/6803",
    registrationUrl: "https://bao-ming.com/eb/content/6803",
    description: "ELLE 國際中文版主辦的時尚路跑，結合運動與風格。",
    source: "bao-ming.com",
    sourceUrl: "https://bao-ming.com/eb/content/6803",
    verified: true,
  },
  {
    name: "2026 松鶴越野",
    nameEn: "2026 Songhe Trail Run",
    region: "taiwan",
    country: "台灣",
    city: "台中市",
    date: new Date("2026-06-14"),
    registrationStart: new Date("2026-02-11"),
    registrationEnd: new Date("2026-04-30"),
    distances: "25K,12K",
    status: "open",
    websiteUrl: "https://bao-ming.com/eb/content/6866",
    registrationUrl: "https://bao-ming.com/eb/content/6866",
    description: "台灣龍虎鳳越野協會主辦的越野跑賽事。",
    source: "bao-ming.com",
    sourceUrl: "https://bao-ming.com/eb/content/6866",
    verified: true,
  },
  {
    name: "2026 Global 6K for Water",
    region: "taiwan",
    country: "台灣",
    city: "台北市",
    date: new Date("2026-05-31"),
    registrationStart: new Date("2026-03-02"),
    registrationEnd: new Date("2026-04-06"),
    distances: "6K",
    status: "open",
    websiteUrl: "https://bao-ming.com/eb/content/6858",
    registrationUrl: "https://bao-ming.com/eb/content/6858",
    description: "每步都是孩子的取水路，公益路跑活動。",
    source: "bao-ming.com",
    sourceUrl: "https://bao-ming.com/eb/content/6858",
    verified: true,
  },
  {
    name: "2026 礁溪越野",
    nameEn: "2026 Jiaoxi Trail Run",
    region: "taiwan",
    country: "台灣",
    city: "宜蘭縣",
    date: new Date("2026-10-04"),
    registrationStart: new Date("2026-02-07"),
    registrationEnd: new Date("2026-08-31"),
    distances: "30K,16K",
    status: "open",
    websiteUrl: "https://bao-ming.com/eb/content/6917",
    registrationUrl: "https://bao-ming.com/eb/content/6917",
    description: "宜蘭礁溪溫泉鄉越野跑賽事。",
    source: "bao-ming.com",
    sourceUrl: "https://bao-ming.com/eb/content/6917",
    verified: true,
  },
  {
    name: "2026 第二屆東石仲夏星光路跑",
    region: "taiwan",
    country: "台灣",
    city: "嘉義縣",
    date: new Date("2026-06-27"),
    registrationStart: new Date("2026-01-06"),
    registrationEnd: new Date("2026-05-31"),
    distances: "半馬,10K",
    status: "open",
    websiteUrl: "https://bao-ming.com/eb/content/6852",
    registrationUrl: "https://bao-ming.com/eb/content/6852",
    description: "東石仲夏星光路跑 × 海鮮星光盛典，夜跑結合在地美食。",
    source: "bao-ming.com",
    sourceUrl: "https://bao-ming.com/eb/content/6852",
    verified: true,
  },
  {
    name: "2026 第十屆虎豹雙棲越野挑戰賽",
    region: "taiwan",
    country: "台灣",
    city: "新北市",
    date: new Date("2026-06-07"),
    registrationStart: new Date("2026-04-01"),
    registrationEnd: new Date("2026-04-24"),
    distances: "25K,12K",
    status: "upcoming",
    websiteUrl: "https://bao-ming.com/eb/content/6951",
    registrationUrl: "https://bao-ming.com/eb/content/6951",
    description: "虎豹雙棲越野挑戰賽第十屆，越野跑經典賽事。",
    source: "bao-ming.com",
    sourceUrl: "https://bao-ming.com/eb/content/6951",
    verified: true,
  },
  {
    name: "2026 MERRELL 健行嘉年華 臺中IVV國際市民健行大會",
    region: "taiwan",
    country: "台灣",
    city: "台中市",
    date: new Date("2026-05-31"),
    registrationStart: new Date("2026-03-02"),
    registrationEnd: new Date("2026-04-06"),
    distances: "12K,6K",
    status: "open",
    websiteUrl: "https://bao-ming.com/eb/content/6858",
    registrationUrl: "https://bao-ming.com/eb/content/6858",
    description: "MERRELL 主辦的健行嘉年華，臺中國際市民健行大會。",
    source: "bao-ming.com",
    sourceUrl: "https://bao-ming.com/eb/content/6827",
    verified: true,
  },
];

async function seed() {
  console.log("🌱 Adding bao-ming.com events...");

  for (const ev of events) {
    const existing = await prisma.event.findFirst({ where: { name: ev.name } });
    if (existing) {
      console.log(`  ⏭️  ${ev.name} (already exists)`);
      continue;
    }
    await prisma.event.create({ data: ev });
    console.log(`  ✅ ${ev.name}`);
  }

  const total = await prisma.event.count();
  console.log(`\n🎉 Done! Total events in DB: ${total}`);
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
