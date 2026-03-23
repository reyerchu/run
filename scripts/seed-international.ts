/**
 * Update and add international marathon events with proper timezone info
 * Source: World Athletics, 運動筆記, official websites
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // First, check existing international events
  const existing = await prisma.event.findMany({
    where: { country: { not: '台灣' } },
    select: { id: true, name: true, date: true, source: true, sourceUrl: true, city: true, country: true }
  });
  console.log(`Existing international events: ${existing.length}`);
  existing.forEach(e => console.log(`  - ${e.name} (${e.country}) ${e.date.toISOString().slice(0,10)} source=${e.source}`));

  // Update existing events with better data
  // 大阪馬拉松 - already has correct date (2026-02-22), update timezone note
  // 芝加哥馬拉松 - Oct 11, 2026 (CDT, UTC-5)
  // 紐約馬拉松 - Nov 1, 2026 (EST, UTC-5)

  // Fix: Update 芝加哥 date description to note local time
  const chicagoEvent = existing.find(e => e.name.includes('芝加哥'));
  if (chicagoEvent) {
    await prisma.event.update({
      where: { id: chicagoEvent.id },
      data: {
        description: '世界六大馬拉松之一，每年十月於芝加哥舉辦。日期為當地時間（CDT, UTC-5）。',
        source: 'World Athletics',
        sourceUrl: 'https://worldathletics.org/competitions/world-athletics-label-road-races',
      }
    });
    console.log('Updated: 芝加哥馬拉松');
  }

  const nyEvent = existing.find(e => e.name.includes('紐約'));
  if (nyEvent) {
    await prisma.event.update({
      where: { id: nyEvent.id },
      data: {
        description: '世界六大馬拉松之一，每年十一月第一個週日於紐約舉辦。日期為當地時間（EST, UTC-5）。',
        source: 'World Athletics',
        sourceUrl: 'https://worldathletics.org/competitions/world-athletics-label-road-races',
      }
    });
    console.log('Updated: 紐約馬拉松');
  }

  const osakaEvent = existing.find(e => e.name.includes('大阪'));
  if (osakaEvent) {
    await prisma.event.update({
      where: { id: osakaEvent.id },
      data: {
        description: '日本大阪冬季代表性馬拉松，日期為當地時間（JST, UTC+9）。',
        source: 'World Athletics / 官網 osaka-marathon.com',
        sourceUrl: 'https://www.osaka-marathon.com/',
      }
    });
    console.log('Updated: 大阪馬拉松');
  }

  // New international events to add (verified from World Athletics + 運動筆記)
  const newEvents = [
    // World Marathon Majors & major international races
    {
      name: '2026 倫敦馬拉松',
      nameEn: '2026 TCS London Marathon',
      date: new Date('2026-04-26T09:30:00+01:00'), // BST
      city: 'London',
      country: '英國',
      distance: '42.195K',
      description: '世界六大馬拉松之一，每年四月於倫敦舉辦。日期為當地時間（BST, UTC+1）。2026年衛冕冠軍 Sawe 對決 Kiplimo、Cheptegei。',
      websiteUrl: 'https://www.tcslondonmarathon.com/',
      source: 'World Athletics',
      sourceUrl: 'https://worldathletics.org/competitions/world-athletics-label-road-races',
      isRecurring: true,
      estimatedMonth: 4,
    },
    {
      name: '2026 波士頓馬拉松',
      nameEn: '2026 Boston Marathon',
      date: new Date('2026-04-20T10:00:00-04:00'), // EDT
      city: 'Boston',
      country: '美國',
      distance: '42.195K',
      description: '世界六大馬拉松之一，也是最古老的年度馬拉松。每年四月第三個週一（愛國者日）於波士頓舉辦。日期為當地時間（EDT, UTC-4）。',
      websiteUrl: 'https://www.baa.org/races/boston-marathon',
      source: 'World Athletics',
      sourceUrl: 'https://worldathletics.org/competitions/world-athletics-label-road-races',
      isRecurring: true,
      estimatedMonth: 4,
    },
    {
      name: '2026 柏林馬拉松',
      nameEn: '2026 BMW Berlin Marathon',
      date: new Date('2026-09-27T09:15:00+02:00'), // CEST
      city: 'Berlin',
      country: '德國',
      distance: '42.195K',
      description: '世界六大馬拉松之一，被譽為最快的馬拉松賽道。每年九月最後一個週日於柏林舉辦。日期為當地時間（CEST, UTC+2）。',
      websiteUrl: 'https://www.bmw-berlin-marathon.com/',
      source: 'World Athletics',
      sourceUrl: 'https://worldathletics.org/competitions/world-athletics-label-road-races',
      isRecurring: true,
      estimatedMonth: 9,
    },
    // 運動筆記國外賽事
    {
      name: '2026 柏林半程馬拉松',
      nameEn: '2026 Generali Berlin Half Marathon',
      date: new Date('2026-03-29T10:00:00+01:00'), // CET
      city: 'Berlin',
      country: '德國',
      distance: '21K',
      description: '柏林春季半程馬拉松。日期為當地時間（CET, UTC+1）。',
      websiteUrl: 'https://www.generali-berliner-halbmarathon.de/',
      source: '運動筆記',
      sourceUrl: 'https://running.biji.co/index.php?q=competition&act=info&cid=12657',
      isRecurring: true,
      estimatedMonth: 3,
    },
    {
      name: '2026 雪梨馬拉松',
      nameEn: '2026 Sydney Marathon',
      date: new Date('2026-08-30T06:00:00+11:00'), // AEST
      city: 'Sydney',
      country: '澳洲',
      distance: '42.195K',
      description: '澳洲最大的馬拉松賽事，路線經過雪梨歌劇院和港灣大橋。日期為當地時間（AEST, UTC+11）。',
      websiteUrl: 'https://www.sydneymarathon.com/',
      source: '運動筆記',
      sourceUrl: 'https://running.biji.co/index.php?q=competition&act=info&cid=12822',
      isRecurring: true,
      estimatedMonth: 8,
    },
    {
      name: '2026 巴塔哥尼亞國際馬拉松',
      nameEn: '2026 Patagonian International Marathon',
      date: new Date('2026-09-05T08:00:00-03:00'), // Chile time
      city: '百內國家公園',
      country: '智利',
      distance: '42K/30K/21K/15K/10K',
      description: '在智利百內國家公園壯觀自然風景中跑步的國際馬拉松。日期為當地時間（CLT, UTC-3）。',
      websiteUrl: 'https://www.patagonianinternationalmarathon.com/',
      source: '運動筆記',
      sourceUrl: 'https://running.biji.co/index.php?q=competition&act=info&cid=12927',
      isRecurring: true,
      estimatedMonth: 9,
    },
    {
      name: '2026 千葉東京灣跨海大橋馬拉松',
      nameEn: '2026 Chiba Aqualine Marathon',
      date: new Date('2026-11-08T09:00:00+09:00'), // JST
      city: '千葉',
      country: '日本',
      distance: '42.195K/21K',
      description: '跑過東京灣跨海大橋的獨特馬拉松體驗。日期為當地時間（JST, UTC+9）。',
      websiteUrl: 'https://chiba-aqualine-marathon.com/',
      source: '運動筆記',
      sourceUrl: 'https://running.biji.co/index.php?q=competition&act=info&cid=12821',
      isRecurring: true,
      estimatedMonth: 11,
    },
    // 日本岡山馬拉松 (from 運動筆記首頁新聞)
    {
      name: '2026 岡山馬拉松',
      nameEn: '2026 Okayama Marathon',
      date: new Date('2026-11-08T09:00:00+09:00'), // JST
      city: '岡山',
      country: '日本',
      distance: '42.195K',
      description: '日本岡山「晴天之國」馬拉松，坡度適中、補給豐富。4/16 開放報名。日期為當地時間（JST, UTC+9）。',
      websiteUrl: 'https://www.okayamamarathon.jp/',
      source: '運動筆記',
      sourceUrl: 'https://running.biji.co/index.php?q=news&act=info&id=113813',
      isRecurring: true,
      estimatedMonth: 11,
    },
    // 濟州島馬拉松 (from 運動筆記 banner)
    {
      name: '2026 濟州島馬拉松',
      nameEn: '2026 Jeju Marathon',
      date: new Date('2026-06-14T07:00:00+09:00'), // KST
      city: '濟州',
      country: '韓國',
      distance: '42.195K/21K/10K',
      description: '韓國濟州島馬拉松，沿海岸線奔跑的美麗賽道。日期為當地時間（KST, UTC+9）。',
      websiteUrl: 'https://www.jejumarathon.com/',
      source: '運動筆記',
      sourceUrl: 'https://running.biji.co/index.php?q=minisite&act=minisite&ads=minisite&minisite_id=180',
      isRecurring: true,
      estimatedMonth: 6,
    },
  ];

  // Check for duplicates before inserting
  const allExisting = await prisma.event.findMany({ select: { name: true } });
  const existingNames = new Set(allExisting.map(e => e.name));

  let added = 0;
  for (const event of newEvents) {
    // Also skip if similar name exists
    const similar = [...existingNames].some(n => 
      n.includes(event.name.replace(/^2026\s*/, '')) || event.name.includes(n.replace(/^.*2026\s*/, '').replace(/\s*2026$/, ''))
    );
    if (existingNames.has(event.name) || similar) {
      console.log(`Skip (exists): ${event.name}`);
      continue;
    }
    await prisma.event.create({
      data: {
        ...event,
        region: 'international',
        distances: event.distance,
        status: event.date > new Date() ? 'upcoming' : 'completed',
        registrationUrl: event.websiteUrl,
      }
    });
    console.log(`Added: ${event.name} (${event.country}, ${event.date.toISOString().slice(0,10)})`);
    added++;
  }

  // Count totals
  const total = await prisma.event.count();
  const intl = await prisma.event.count({ where: { country: { not: '台灣' } } });
  console.log(`\n=== Done ===`);
  console.log(`New international events added: ${added}`);
  console.log(`Total international events: ${intl}`);
  console.log(`Total events in DB: ${total}`);

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
