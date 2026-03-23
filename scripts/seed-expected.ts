import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 週期性賽事 — 尚未公布 2026/2027 年具體資訊，依往年慣例推估
const expectedEvents = [
  // 台灣
  {
    name: "田中馬拉松",
    region: "taiwan",
    city: "彰化",
    date: new Date("2026-11-08"), // 往年約 11 月第一或二個週末
    distances: JSON.stringify(["全馬 42.195K", "半馬 21K", "10K"]),
    status: "expected",
    isRecurring: true,
    estimatedMonth: 11,
    description: "全台最熱情的馬拉松，沿途在地居民加油補給，被譽為「台灣最友善的馬拉松」。每年約 11 月舉辦。",
  },
  {
    name: "礁溪溫泉馬拉松",
    region: "taiwan",
    city: "宜蘭",
    date: new Date("2026-11-15"), // 往年約 11 月
    distances: JSON.stringify(["半馬 21K", "10K", "5K"]),
    status: "expected",
    isRecurring: true,
    estimatedMonth: 11,
    description: "宜蘭礁溪溫泉區路線，完賽後可泡溫泉。每年約 11 月舉辦。",
  },
  {
    name: "臺北馬拉松",
    region: "taiwan",
    city: "台北",
    date: new Date("2026-12-20"), // 往年約 12 月第三個週日
    distances: JSON.stringify(["全馬 42.195K", "半馬 21K"]),
    status: "expected",
    isRecurring: true,
    estimatedMonth: 12,
    featured: true,
    description: "台灣最大城市馬拉松，沿途經過台北 101、總統府等知名地標。每年約 12 月舉辦。",
  },
  {
    name: "太魯閣峽谷馬拉松",
    region: "taiwan",
    city: "花蓮",
    date: new Date("2026-11-07"), // 往年約 11 月初
    distances: JSON.stringify(["全馬 42.195K", "半馬 21K", "5K"]),
    status: "expected",
    isRecurring: true,
    estimatedMonth: 11,
    description: "穿越太魯閣國家公園的壯觀峽谷路線，台灣最美賽道之一。每年約 11 月舉辦。",
  },
  {
    name: "日月潭環湖馬拉松",
    region: "taiwan",
    city: "南投",
    date: new Date("2026-10-25"), // 往年約 10 月底
    distances: JSON.stringify(["全馬 42.195K", "半馬 21K"]),
    status: "expected",
    isRecurring: true,
    estimatedMonth: 10,
    description: "環繞日月潭的絕美湖景路線，跑步與美景兼得。每年約 10 月舉辦。",
  },
  {
    name: "高雄馬拉松",
    region: "taiwan",
    city: "高雄",
    date: new Date("2027-02-07"), // 往年約 2 月
    distances: JSON.stringify(["全馬 42.195K", "半馬 21K", "10K"]),
    status: "expected",
    isRecurring: true,
    estimatedMonth: 2,
    description: "南台灣最大規模馬拉松，冬季氣候宜人。每年約 1-2 月舉辦。",
  },
  {
    name: "渣打臺北公益馬拉松",
    region: "taiwan",
    city: "台北",
    date: new Date("2027-01-18"), // 往年約 1 月
    distances: JSON.stringify(["全馬 42.195K", "半馬 21K", "10K", "3K"]),
    status: "expected",
    isRecurring: true,
    estimatedMonth: 1,
    description: "結合公益的城市馬拉松，路線平坦適合追求 PB。每年約 1 月舉辦。",
  },
  {
    name: "長榮航空城市觀光馬拉松",
    region: "taiwan",
    city: "台北",
    date: new Date("2026-10-25"), // 往年約 10 月底
    distances: JSON.stringify(["全馬 42.195K", "半馬 21K", "10K"]),
    status: "expected",
    isRecurring: true,
    estimatedMonth: 10,
    description: "長榮航空冠名贊助的城市觀光馬拉松。每年約 10 月舉辦。",
  },

  // 國際
  {
    name: "2027 Tokyo Marathon 東京馬拉松",
    nameEn: "Tokyo Marathon",
    region: "international",
    country: "日本",
    city: "東京",
    date: new Date("2027-03-07"), // 往年約 3 月第一個週日
    distances: JSON.stringify(["全馬 42.195K", "10K"]),
    status: "expected",
    isRecurring: true,
    estimatedMonth: 3,
    featured: true,
    websiteUrl: "https://www.marathon.tokyo/en/",
    description: "世界六大馬拉松之一，穿越東京都心的經典賽道。每年約 3 月初舉行。",
  },
  {
    name: "2026 Valencia Marathon 瓦倫西亞馬拉松",
    nameEn: "Valencia Marathon",
    region: "international",
    country: "西班牙",
    city: "瓦倫西亞",
    date: new Date("2026-12-06"), // 往年約 12 月第一個週日
    distances: JSON.stringify(["全馬 42.195K"]),
    status: "expected",
    isRecurring: true,
    estimatedMonth: 12,
    websiteUrl: "https://www.valenciaciudaddelrunning.com/en/marathon/",
    description: "歐洲最快賽道之一，平坦沿海路線，PB 聖地。每年約 12 月初舉行。",
  },
  {
    name: "2026 Singapore Marathon 新加坡馬拉松",
    nameEn: "Singapore Marathon",
    region: "international",
    country: "新加坡",
    city: "新加坡",
    date: new Date("2026-12-06"), // 往年約 12 月初
    distances: JSON.stringify(["全馬 42.195K", "半馬 21K", "10K", "5K"]),
    status: "expected",
    isRecurring: true,
    estimatedMonth: 12,
    description: "東南亞最大馬拉松之一，夜跑模式穿越濱海灣金沙等地標。每年約 12 月舉行。",
  },
];

async function main() {
  console.log("🌱 Adding expected recurring events...");

  for (const event of expectedEvents) {
    await prisma.event.create({ data: event });
  }

  const total = await prisma.event.count();
  console.log(`✅ Added ${expectedEvents.length} expected events (total: ${total})`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
