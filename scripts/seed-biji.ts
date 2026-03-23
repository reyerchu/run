import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SOURCE = '運動筆記';
const sourceUrl = (cid: number) => `https://running.biji.co/index.php?q=competition&act=info&cid=${cid}`;

async function main() {
  // 1. Get all existing events
  const existing = await prisma.event.findMany({ select: { id: true, name: true, sourceUrl: true, date: true } });
  console.log(`現有賽事: ${existing.length} 筆`);

  let updated = 0;
  let created = 0;

  // 2. Update existing events missing sourceUrl
  const updates: { name: string; matchPattern: string; cid: number; dateUpdate?: string }[] = [
    { name: 'TS Women Run', matchPattern: 'TS Women Run', cid: 12827 },
    { name: '新竹半程馬拉松', matchPattern: '新竹半程馬拉松', cid: 12871 },
    { name: '海風馬拉松', matchPattern: '海風馬拉松', cid: 12833 },
    { name: '日月潭環湖馬拉松', matchPattern: '日月潭環湖馬拉松', cid: 12897, dateUpdate: '2026-11-01T00:00:00+08:00' },
    { name: '田中馬拉松', matchPattern: '田中馬', cid: 12929 },
  ];

  for (const u of updates) {
    const evt = existing.find(e => e.name.includes(u.matchPattern));
    if (evt) {
      const data: any = { sourceUrl: sourceUrl(u.cid), source: SOURCE };
      if (u.dateUpdate) data.date = new Date(u.dateUpdate);
      await prisma.event.update({ where: { id: evt.id }, data });
      console.log(`更新: ${evt.name} → sourceUrl=${sourceUrl(u.cid)}${u.dateUpdate ? ' + date' : ''}`);
      updated++;
    } else {
      console.log(`找不到: ${u.matchPattern}`);
    }
  }

  // 3. New events to add
  const newEvents: { name: string; date: string; city: string; distances: string; cid: number }[] = [
    // March
    { name: '第10屆馬祖北竿硬地超級馬拉松', date: '2026-03-20', city: '連江縣', distances: '50K/25K/12.5K', cid: 12765 },
    { name: '2026晚崙西亞東河馬拉松', date: '2026-03-21', city: '臺東縣', distances: '42K/21K', cid: 12896 },
    { name: '2026花蓮太平洋浪花半程馬拉松', date: '2026-03-21', city: '花蓮縣', distances: '21K/12K', cid: 12861 },
    { name: '2026 大地之母系列-田野蘭鄉國際馬拉松', date: '2026-03-22', city: '臺南市', distances: '42K/21K/10.5K', cid: 12800 },
    { name: '2026 山海戀之新竹市戀戀海岸線馬拉松', date: '2026-03-22', city: '新竹市', distances: '42K/25K', cid: 12489 },
    { name: '2026神岡馬', date: '2026-03-22', city: '臺中市', distances: '42K/21K', cid: 12638 },
    { name: '2026 PUMA螢光夜跑', date: '2026-03-28', city: '臺北市', distances: '21K/10K', cid: 12832 },
    { name: '2026 Trail Far Far Away 越野發發爾衛', date: '2026-03-28', city: '臺中市', distances: '70K/40K', cid: 12781 },
    { name: '2026中山香香尋寶半程馬拉松', date: '2026-03-28', city: '宜蘭縣', distances: '21K/10K', cid: 12804 },
    { name: '2026大亞旺萊馬拉松', date: '2026-03-29', city: '臺南市', distances: '42K/30K/21K/14K', cid: 12671 },
    { name: '2026新店香魚川路跑', date: '2026-03-29', city: '新北市', distances: '42K', cid: 12805 },
    { name: '2026木棉花半程馬拉松', date: '2026-03-29', city: '臺南市', distances: '21K/11K', cid: 12572 },
    // April
    { name: '2026 CTAU超馬系列賽 橫越臺灣', date: '2026-04-03', city: '南投縣', distances: '228K/118K/110K', cid: 12768 },
    { name: '2026「愛在光復」路跑嘉年華', date: '2026-04-04', city: '花蓮縣', distances: '42K/21K/12K', cid: 12935 },
    { name: '2026年旭海超級馬拉松', date: '2026-04-11', city: '屏東縣', distances: '100K/70K/50K', cid: 12828 },
    { name: '2026杏輝宜蘭馬拉松', date: '2026-04-11', city: '宜蘭縣', distances: '42K/21K/11K', cid: 12840 },
    { name: 'SKY HUNTER 奇岩連峰越野挑戰賽', date: '2026-04-11', city: '臺北市', distances: '30K/24K/13K', cid: 12839 },
    { name: '2026 TAIPEI ULTRA TRAIL', date: '2026-04-12', city: '臺北市', distances: '50K/30K/20K/10K', cid: 12806 },
    { name: '2026 ZEPRO RUN 高雄場', date: '2026-04-12', city: '高雄市', distances: '21K/10K', cid: 12842 },
    { name: '2026年新北市土城桐花祭路跑賽', date: '2026-04-12', city: '新北市', distances: '21K/10.5K', cid: 12784 },
    { name: '2026花旗木半程馬拉松-竹崎花開RUN起來', date: '2026-04-12', city: '嘉義縣', distances: '21K/11K', cid: 12644 },
    { name: '2026集集國際馬拉松', date: '2026-04-12', city: '南投縣', distances: '21K/13.14K', cid: 12737 },
    { name: '2026 Rock\'n\'Roll Running Series - Taipei 搖滾路跑', date: '2026-04-18', city: '臺北市', distances: '21K/10K', cid: 12749 },
    { name: '2026八百壯士系列--制霸水金九超馬賽', date: '2026-04-18', city: '新北市', distances: '101.8K/49.7K', cid: 12730 },
    { name: '2026淡江大橋通車路跑活動', date: '2026-04-18', city: '新北市', distances: '21K/10K', cid: 12819 },
    { name: '2026 ZEPRO RUN 桃園場', date: '2026-04-19', city: '桃園市', distances: '21K/10K', cid: 12848 },
    { name: '2026七股生態馬拉松', date: '2026-04-19', city: '臺南市', distances: '42K/21K/10K', cid: 12843 },
    { name: '2026光境半程馬拉松挑戰賽-升龍道', date: '2026-04-19', city: '新北市', distances: '21K/13K', cid: 12835 },
    { name: '2026新北市鐵道馬拉松接力賽', date: '2026-04-19', city: '新北市', distances: '42K', cid: 12747 },
    { name: '2026 台北科技盃愛地球公益路跑', date: '2026-04-19', city: '臺北市', distances: '21K/10K', cid: 12785 },
    { name: '2026花蓮卓溪Masial祝福路跑', date: '2026-04-25', city: '花蓮縣', distances: '21K/10K', cid: 12909 },
    { name: '2026 ZEPRO RUN 台中場', date: '2026-04-26', city: '臺中市', distances: '21K/10K', cid: 12849 },
    { name: '2026 國家地理路跑-RUN FOR EARTH', date: '2026-04-26', city: '臺北市', distances: '21K/10K', cid: 12725 },
    { name: '2026 阿里山雲端馬拉松', date: '2026-04-26', city: '嘉義縣', distances: '42K/21K/10K', cid: 12818 },
    { name: '浪漫台三線2026年第10屆新竹縣「戀戀桐花」全國馬拉松', date: '2026-04-26', city: '新竹縣', distances: '42K/21K', cid: 12490 },
    { name: '2026浪漫台三線新店老街路跑賽', date: '2026-04-26', city: '苗栗縣', distances: '53.5K/42.8K/21.4K/10.7K', cid: 12904 },
    // May
    { name: '2026彰化同濟盃全國馬拉松暨親子路跑', date: '2026-05-03', city: '彰化縣', distances: '42K/21K/10K', cid: 12738 },
    { name: '2026年夏日馬拉松 - 嘉義大埔場', date: '2026-05-16', city: '嘉義縣', distances: '42K/21K', cid: 12850 },
    { name: '2026 松鶴越野', date: '2026-05-17', city: '南投縣', distances: '50K/20K/13K', cid: 12902 },
    { name: '2026八百壯士系列--制霸草梅超馬賽', date: '2026-05-17', city: '嘉義縣', distances: '100.8K/49.6K', cid: 12731 },
    { name: '2026桃園市珍珠海岸馬拉松接力賽', date: '2026-05-17', city: '桃園市', distances: '21.8K', cid: 12933 },
    { name: '2026宜蘭農特產公益馬拉松', date: '2026-05-23', city: '宜蘭縣', distances: '42K/21K/10K', cid: 12936 },
    { name: '2026中興新村半程馬拉松', date: '2026-05-24', city: '南投縣', distances: '21K/10K', cid: 12520 },
    { name: '2026西拉雅-官佃全國路跑賽', date: '2026-05-24', city: '臺南市', distances: '42K/10K', cid: 12946 },
    { name: '2026跑向成功 三仙台星光夜跑馬拉松', date: '2026-05-30', city: '臺東縣', distances: '21K/11K', cid: 12910 },
    { name: '2026全台PAPAGO歡樂跑--蘆竹場', date: '2026-05-31', city: '桃園市', distances: '42K/23.4K', cid: 12918 },
    // June
    { name: '2026 台灣棲蘭林道越野', date: '2026-06-06', city: '宜蘭縣', distances: '100K/75K/50K/25K/10K', cid: 12938 },
    { name: '2026年太平山雲端漫步路跑', date: '2026-06-06', city: '宜蘭縣', distances: '42K/21K', cid: 12884 },
    { name: '2026 雲林半程馬拉松', date: '2026-06-07', city: '雲林縣', distances: '21K/10K', cid: 12630 },
    { name: '夏日馬拉松 - 南投埔里場', date: '2026-06-13', city: '南投縣', distances: '42K/21K', cid: 12886 },
    { name: '2026全台PAPAGO歡樂跑--苗栗場', date: '2026-06-28', city: '苗栗縣', distances: '42K/21K', cid: 12919 },
    // July-December
    { name: '第13屆SIMHOPE x 大腳丫全國馬拉松接力賽', date: '2026-07-05', city: '臺中市', distances: '42K', cid: 12810 },
    { name: '2026全台PAPAGO歡樂跑--桃園場', date: '2026-07-26', city: '桃園市', distances: '42K/21K', cid: 12920 },
    { name: '2026全台PAPAGO歡樂跑--龍潭場', date: '2026-08-23', city: '桃園市', distances: '42K/21K', cid: 12921 },
    { name: '2026 第五屆泰安原鄉秘境森林馬拉松', date: '2026-09-20', city: '苗栗縣', distances: '50K/43K/23K', cid: 12889 },
    { name: '2026 山城星光馬拉松', date: '2026-10-03', city: '苗栗縣', distances: '42K/21K', cid: 12954 },
    { name: '2026 第五屆壽司半程馬拉松', date: '2026-10-04', city: '雲林縣', distances: '21K/10K', cid: 12905 },
    { name: '2026 華山論劍湖超級馬拉松', date: '2026-10-04', city: '雲林縣', distances: '100K', cid: 12043 },
    { name: '2026八百壯士系列--制霸極北超馬賽', date: '2026-10-04', city: '新北市', distances: '105.3K/57.4K', cid: 12732 },
    { name: '2026宜蘭縣冬山河水岸馬拉松', date: '2026-10-04', city: '宜蘭縣', distances: '42K/21K', cid: 12939 },
    { name: '2026新屋魚米之鄉馬拉松', date: '2026-10-04', city: '桃園市', distances: '21K/10K', cid: 12876 },
    { name: '2026府北馬拉松', date: '2026-10-11', city: '臺南市', distances: '42K/21K', cid: 12888 },
    { name: '2026蘆竹機捷馬拉松', date: '2026-10-11', city: '桃園市', distances: '42K/21K/10K', cid: 12887 },
    { name: '2026 華陀為高雄公益路跑', date: '2026-10-18', city: '高雄市', distances: '21K/11K', cid: 12890 },
    { name: '2026虎馬第八屆全國烤雞馬拉松', date: '2026-10-25', city: '雲林縣', distances: '21K/11K', cid: 12859 },
    { name: '2026龍崎文衡殿第三屆赤兔馬全國馬拉松', date: '2026-10-25', city: '臺南市', distances: '42K/21K/10K', cid: 12942 },
    { name: '南投馬11th-草鞋墩馬拉松', date: '2026-10-25', city: '南投縣', distances: '42K/22K/10K', cid: 12926 },
    { name: '2026八百壯士系列--制霸極西超馬賽', date: '2026-11-01', city: '新北市', distances: '102.5K/51.7K', cid: 12733 },
    { name: '2026嘉義雙潭馬拉松菁英賽', date: '2026-11-01', city: '嘉義市', distances: '42K/21K', cid: 12875 },
    { name: '2026菊島澎湖跨海馬拉松', date: '2026-11-01', city: '澎湖縣', distances: '42K/21K/11K', cid: 12844 },
    { name: '跑吧!孩子!2026知本溫泉公益馬拉松', date: '2026-11-01', city: '臺東縣', distances: '42K/21K/10K', cid: 12894 },
    { name: '飛虎30週年友愛公益馬拉松', date: '2026-11-01', city: '雲林縣', distances: '42K/21K/10K', cid: 12901 },
    { name: '2026 屏東馬拉松', date: '2026-11-08', city: '屏東縣', distances: '42K/21K/11K', cid: 12812 },
    { name: '2026板橋馬拉松路跑賽', date: '2026-11-08', city: '新北市', distances: '42K/21K/10K', cid: 12882 },
    { name: '2026 日本航空墾丁國際馬拉松', date: '2026-11-15', city: '屏東縣', distances: '42K/21K/12K', cid: 12838 },
    { name: '2026 蘆洲觀音山馬拉松', date: '2026-11-15', city: '新北市', distances: '42K/21K/10K', cid: 12885 },
    { name: '2026鹿港馬拉松', date: '2026-11-15', city: '彰化縣', distances: '42K/21K/10K', cid: 12934 },
    { name: '2026桃園落羽松秘境馬拉松', date: '2026-11-22', city: '桃園市', distances: '42K/21K/10K', cid: 12862 },
    { name: '2026萬丹紅豆公益馬拉松', date: '2026-11-22', city: '屏東縣', distances: '42K/22K/10K', cid: 12880 },
    { name: '2026 東石全國馬拉松', date: '2026-11-29', city: '嘉義縣', distances: '42K/21K/10K', cid: 12813 },
    { name: '2026台南秋季馬拉松', date: '2026-11-29', city: '臺南市', distances: '42K/21K/10K', cid: 12923 },
    { name: '2026 第二屆麗晨臺中國際馬拉松', date: '2026-12-06', city: '臺中市', distances: '42K/21K/10K', cid: 12814 },
    { name: '2026新竹城市馬拉松', date: '2026-12-06', city: '新竹市', distances: '42K/21K/10K', cid: 12932 },
    { name: '2026第八屆故宮南院馬拉松', date: '2026-12-06', city: '嘉義縣', distances: '42K/21K/11K', cid: 12864 },
    { name: '2026 第 12 屆美濃馬拉松', date: '2026-12-13', city: '高雄市', distances: '45K', cid: 12945 },
  ];

  // Check which already exist (by name similarity)
  const existingNames = existing.map(e => e.name);

  for (const evt of newEvents) {
    // Check for duplicates by partial name match
    const isDup = existingNames.some(n => {
      const a = n.replace(/\s+/g, '').toLowerCase();
      const b = evt.name.replace(/\s+/g, '').toLowerCase();
      return a.includes(b) || b.includes(a) || 
        // specific known duplicates
        (a.includes('將軍漁港') && b.includes('將軍漁港')) ||
        (a.includes('長濱雙浪') && b.includes('長濱雙浪')) ||
        (a.includes('聖母廟') && b.includes('聖母廟')) ||
        (a.includes('台北星光') && b.includes('台北星光')) ||
        (a.includes('木架山') && b.includes('木架山')) ||
        (a.includes('ellerun') && b.includes('ellerun')) ||
        (a.includes('虎豹雙棲') && b.includes('虎豹雙棲'));
    });

    if (isDup) {
      console.log(`跳過(已存在): ${evt.name}`);
      continue;
    }

    // Determine region from city
    const region = 'Taiwan';

    await prisma.event.create({
      data: {
        name: evt.name,
        date: new Date(`${evt.date}T00:00:00+08:00`),
        city: evt.city,
        region,
        country: '台灣',
        distances: evt.distances,
        source: SOURCE,
        sourceUrl: sourceUrl(evt.cid),
        status: 'upcoming',
      },
    });
    created++;
    console.log(`新增: ${evt.name} (${evt.date})`);
  }

  const total = await prisma.event.count();
  console.log(`\n=== 完成 ===`);
  console.log(`更新: ${updated} 筆`);
  console.log(`新增: ${created} 筆`);
  console.log(`總共: ${total} 筆`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
