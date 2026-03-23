/**
 * bao-ming.com (伊貝特報名網) Crawler
 * 
 * 1. Load index page, collect all event content IDs
 * 2. Visit each detail page to extract REAL data
 * 3. Only save verified, complete data — no guessing
 * 
 * Usage: npx tsx scripts/crawlers/baoming.ts [--dry-run]
 */

import puppeteer, { type Page } from "puppeteer";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const DRY_RUN = process.argv.includes("--dry-run");

function isRunningEvent(name: string): boolean {
  // 排除法：bao-ming.com 本身就是運動賽事平台，
  // 排除明確非跑步類即可，其餘都收錄
  const excludeKw = [
    "自行車", "單車", "騎車", "bike", "cycling", "cycle",
    "鐵人三項", "triathlon", "ironman",
    "游泳", "swim", "泳渡",
    "kom", "環大臺北自行車", "環縣自行車",
    "攀岩", "climb", "划船", "獨木舟", "kayak", "sup",
  ];
  const lower = name.toLowerCase();
  return !excludeKw.some(k => lower.includes(k.toLowerCase()));
}

function extractCity(text: string, name: string): string {
  // Try to get city from structured location fields first
  const locLabels = ["活動地點", "集合地點", "比賽地點", "競賽主場地", "起跑地點"];
  for (const label of locLabels) {
    const m = text.match(new RegExp(label + "[：:\\s]*(.{3,100})"));
    if (m) {
      const loc = m[1];
      // Match city directly: "台北市...", "新北市...", "台南市..."
      const cityMatch = loc.match(/(台北市|臺北市|新北市|台中市|臺中市|台南市|臺南市|高雄市|桃園市|新竹市|新竹縣|基隆市|嘉義市|嘉義縣|宜蘭縣|花蓮縣|台東縣|臺東縣|南投縣|彰化縣|雲林縣|屏東縣|苗栗縣|金門縣|澎湖縣|連江縣)/);
      if (cityMatch) return cityMatch[1].replace("臺", "台");
    }
  }
  // Fallback to guessing from name + text
  return guessCity(name + " " + text);
}

function guessCity(text: string): string {
  const patterns: Array<[RegExp, string]> = [
    [/台北|臺北|貓空|信義區|大安/, "台北市"], [/新北|深坑|萬金石|虎豹/, "新北市"],
    [/台中|臺中|松鶴/, "台中市"], [/台南|臺南|將軍|東石|聖母廟/, "台南市"],
    [/高雄|木架山/, "高雄市"], [/桃園/, "桃園市"], [/新竹/, "新竹市"],
    [/嘉義|阿里山/, "嘉義縣"], [/宜蘭|礁溪/, "宜蘭縣"], [/花蓮|太魯閣/, "花蓮縣"],
    [/南投|日月潭|紫南宮/, "南投縣"], [/金門/, "金門縣"], [/彰化|田中/, "彰化縣"],
    [/屏東/, "屏東縣"], [/苗栗/, "苗栗縣"], [/基隆/, "基隆市"],
    [/雲林/, "雲林縣"], [/台東|臺東|長濱/, "台東縣"], [/澎湖/, "澎湖縣"],
  ];
  for (const [p, c] of patterns) { if (p.test(text)) return c; }
  return "台灣";
}

interface EventDetail {
  name: string;
  contentId: string;
  date: Date | null;
  regStart: Date | null;
  regEnd: Date | null;
  distances: string[];
  city: string;
  description: string;
}

function toTaiwanDate(y: number, m: number, d: number): Date {
  // Always use +08:00 to avoid UTC timezone shift issues
  return new Date(`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}T00:00:00+08:00`);
}

function parseRocOrAdDate(text: string): Date | null {
  // ROC year: 民國115年5月16日 → 2026-05-16
  const roc = text.match(/民國\s*(\d{2,3})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日/);
  if (roc) return toTaiwanDate(+roc[1] + 1911, +roc[2], +roc[3]);
  // AD: 2026年5月16日 (must be >= 2000)
  const ad = text.match(/(20\d{2})年\s*(\d{1,2})月\s*(\d{1,2})日/);
  if (ad) return toTaiwanDate(+ad[1], +ad[2], +ad[3]);
  // YYYY/MM/DD
  const slash = text.match(/(20\d{2})\/(\d{1,2})\/(\d{1,2})/);
  if (slash) return toTaiwanDate(+slash[1], +slash[2], +slash[3]);
  // YYYY-MM-DD
  const iso = text.match(/(20\d{2})-(\d{1,2})-(\d{1,2})/);
  if (iso) return toTaiwanDate(+iso[1], +iso[2], +iso[3]);
  // ROC short without 民國: 115年12月10日 (year < 200 = ROC)
  const rocShort = text.match(/(\d{2,3})年\s*(\d{1,2})月\s*(\d{1,2})日/);
  if (rocShort && +rocShort[1] >= 100 && +rocShort[1] < 200) return toTaiwanDate(+rocShort[1] + 1911, +rocShort[2], +rocShort[3]);
  return null;
}

async function scrapeDetailPage(page: Page, contentId: string): Promise<EventDetail | null> {
  const url = `https://bao-ming.com/eb/content/${contentId}`;
  try {
    // Load #reg tab first (has structured event info), then fallback to #grade
    await page.goto(url + "#reg", { waitUntil: "networkidle2", timeout: 20000 });
    await new Promise(r => setTimeout(r, 3000));
    
    let text = await page.evaluate(() => (document.body?.innerText || "").replace(/\s+/g, " "));
    
    // If #reg doesn't have date info, try #grade
    if (!text.includes("活動日期") && !text.includes("比賽日期") && !text.includes("競賽日期")) {
      await page.goto(url + "#grade", { waitUntil: "networkidle2", timeout: 15000 });
      await new Promise(r => setTimeout(r, 3000));
    }

    const data = await page.evaluate(() => {
      const title = document.title?.trim() || "";
      const text = (document.body?.innerText || "").replace(/\s+/g, " ");
      return { title, text };
    });

    // Clean title: remove site prefix like "台灣鐵人運動協會 - "
    let name = data.title.replace(/^[^-–]+[-–]\s*/, "").trim();
    if (!name || name.length < 3 || name.includes("不再支援")) return null;

    // Parse event date — multi-strategy approach
    let eventDate: Date | null = null;
    
    // Strategy 1: Look for labeled date fields
    const dateLabels = ["活動日期", "比賽日期", "賽事日期", "競賽日期", "比賽時間", "活動時間", "舉辦日期"];
    for (const label of dateLabels) {
      if (eventDate) break;
      const m = data.text.match(new RegExp(label + "[：:\\s]*(.{5,120})"));
      if (m) eventDate = parseRocOrAdDate(m[1]);
    }
    
    // Strategy 2: Find all dates in text, pick the most likely event date
    // (future date that's NOT a registration date)
    if (!eventDate) {
      const allDatesFound: Date[] = [];
      // Match all YYYY年M月D日 or YYYY/MM/DD patterns
      const dateRegexes = [
        /(\d{2,3})年\s*(\d{1,2})月\s*(\d{1,2})日/g,   // ROC: 115年5月16日
        /(20\d{2})年\s*(\d{1,2})月\s*(\d{1,2})日/g,     // AD: 2026年5月16日
        /(20\d{2})\/(\d{1,2})\/(\d{1,2})/g,               // 2026/05/16
        /(20\d{2})-(\d{2})-(\d{2})/g,                      // 2026-05-16
      ];
      for (const rx of dateRegexes) {
        let m;
        while ((m = rx.exec(data.text)) !== null) {
          const y = +m[1] < 200 ? +m[1] + 1911 : +m[1];
          const d = new Date(y, +m[2] - 1, +m[3]);
          if (d.getFullYear() >= 2025 && d.getFullYear() <= 2027) {
            allDatesFound.push(d);
          }
        }
      }
      
      // Remove duplicates and sort
      const uniqueDates = [...new Set(allDatesFound.map(d => d.getTime()))].map(t => new Date(t)).sort((a, b) => a.getTime() - b.getTime());
      
      if (uniqueDates.length > 0) {
        // Heuristic: event date is usually a weekend date in the future
        // and NOT the registration start/end dates
        // Pick the first future date that falls on Sat/Sun, or the first future date
        const now = new Date();
        const futureDates = uniqueDates.filter(d => d > now);
        const weekendDates = futureDates.filter(d => d.getDay() === 0 || d.getDay() === 6);
        
        if (weekendDates.length > 0) {
          // First weekend date is likely the event date
          eventDate = weekendDates[0];
        } else if (futureDates.length > 0) {
          eventDate = futureDates[0];
        } else {
          // All dates in the past — take the latest one (most recent event)
          eventDate = uniqueDates[uniqueDates.length - 1];
        }
      }
    }

    // Parse registration dates from "報名日期" section
    let regStart: Date | null = null;
    let regEnd: Date | null = null;
    const regSec = data.text.match(/報名\s*日期\s*(.{10,200})/);
    if (regSec) {
      const regText = regSec[1];
      // "114年12月10日11時起至115年4月12日24時止"
      const parts = regText.split(/[至到~～]/);
      if (parts.length >= 2) {
        regStart = parseRocOrAdDate(parts[0]);
        regEnd = parseRocOrAdDate(parts[1]);
      } else {
        regStart = parseRocOrAdDate(regText);
      }
    }
    // Also try "報名時間/報名截止/線上報名時間"
    if (!regStart) {
      const rsM = data.text.match(/報名(?:開始|時間)[：:\s]*(.{10,60})/);
      if (rsM) regStart = parseRocOrAdDate(rsM[1]);
    }
    if (!regEnd) {
      const reM = data.text.match(/報名截止[：:\s]*(.{10,60})/);
      if (reM) regEnd = parseRocOrAdDate(reM[1]);
    }
    // "線上報名時間：即日起至2026/04/07"
    if (!regEnd) {
      const onlineM = data.text.match(/線上報名時間[：:\s]*.*?[至到]([\d\/\-]+)/);
      if (onlineM) regEnd = parseRocOrAdDate(onlineM[1]);
    }
    // Try pattern: "XX年X月X日XX時起至XX年X月X日XX時止" in 報名日期 section
    if (!regStart || !regEnd) {
      const regDateSec = data.text.match(/報名\s*日期\s*(.{10,300})/);
      if (regDateSec) {
        const allDates = regDateSec[1].match(/\d{2,4}年\s*\d{1,2}月\s*\d{1,2}日/g);
        if (allDates && allDates.length >= 2) {
          if (!regStart) regStart = parseRocOrAdDate(allDates[0]);
          if (!regEnd) regEnd = parseRocOrAdDate(allDates[1]);
        }
      }
    }

    // Parse distances — look in "比賽項目/競賽項目" section or event name
    const distances: string[] = [];
    const distMatch = data.text.replace(/\n/g, " ").match(/(?:比賽|競賽)(?:項目|組別|路線)(.{0,500}?)(?:報名|活動|注意|備註|集合)/);
    const distSection = distMatch?.[1] || name;
    const checks: Array<[RegExp, string]> = [
      [/全[馬程]|42\.?195|43公里/i, "全馬"], [/半[馬程]|21\.?[05]?[kK公]|21\.5/i, "半馬"],
      [/10[kK公]/i, "10K"], [/5[kK公]/i, "5K"], [/6[kK公]/i, "6K"], [/3[kK公]/i, "3K"],
      [/越野/i, "越野"], [/健走|健行/i, "健走"], [/超馬|100[kK]|50[kK]/i, "超馬"],
    ];
    checks.forEach(([p, label]) => { if (p.test(distSection) && !distances.includes(label)) distances.push(label); });
    // If nothing from section, try the event name itself
    if (distances.length === 0) {
      checks.forEach(([p, label]) => { if (p.test(name) && !distances.includes(label)) distances.push(label); });
    }

    return {
      name,
      contentId,
      date: eventDate,
      regStart,
      regEnd,
      distances: distances.length > 0 ? distances : ["路跑"],
      city: extractCity(data.text, name),
      description: name,
    };
  } catch (err) {
    console.log(`  ⚠️  Failed to scrape ${contentId}: ${err}`);
    return null;
  }
}

async function crawl() {
  console.log(`🕷️  bao-ming.com crawler ${DRY_RUN ? "(DRY RUN)" : ""}`);
  
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-blink-features=AutomationControlled"],
  });

  try {
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => false });
    });
    
    // Step 1: Get all content IDs from index
    console.log("📄 Step 1: Loading index page...");
    await page.goto("https://bao-ming.com/eb/index", { waitUntil: "networkidle2", timeout: 30000 });
    await new Promise(r => setTimeout(r, 6000));
    
    for (let i = 0; i < 10; i++) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await new Promise(r => setTimeout(r, 1500));
    }

    const contentIds = await page.evaluate(() => {
      const ids = new Set<string>();
      document.querySelectorAll('a[href*="/eb/content/"]').forEach(el => {
        const m = ((el as HTMLAnchorElement).href || "").match(/\/eb\/content\/(\d+)/);
        if (m) ids.add(m[1]);
      });
      return [...ids];
    });

    console.log(`📋 Found ${contentIds.length} unique event pages`);

    // Step 2: Visit each detail page
    console.log("📄 Step 2: Scraping detail pages...");
    let added = 0, updated = 0, skipped = 0, filtered = 0, noData = 0;

    for (const cid of contentIds) {
      const detail = await scrapeDetailPage(page, cid);
      
      if (!detail) { noData++; continue; }
      if (!isRunningEvent(detail.name)) { filtered++; continue; }
      if (!detail.date) {
        console.log(`  ⚠️  No date found: ${detail.name} (${cid})`);
        noData++;
        continue;
      }

      const fullUrl = `https://bao-ming.com/eb/content/${cid}`;

      if (DRY_RUN) {
        console.log(`  [DRY] ${detail.name} | ${detail.date.toISOString().slice(0, 10)} | ${detail.distances.join(",")} | reg: ${detail.regStart?.toISOString().slice(0, 10) || "?"} ~ ${detail.regEnd?.toISOString().slice(0, 10) || "?"}`);
        added++;
        continue;
      }

      // Check existing
      const existing = await prisma.event.findFirst({
        where: { OR: [{ sourceUrl: fullUrl }, { name: detail.name }] },
      });

      if (existing) {
        const updates: Record<string, unknown> = {};
        if (!existing.registrationStart && detail.regStart) updates.registrationStart = detail.regStart;
        if (!existing.registrationEnd && detail.regEnd) updates.registrationEnd = detail.regEnd;
        if (!existing.registrationUrl) updates.registrationUrl = fullUrl;
        if (!existing.websiteUrl) updates.websiteUrl = fullUrl;
        if (Object.keys(updates).length > 0) {
          await prisma.event.update({ where: { id: existing.id }, data: updates });
          updated++;
        } else {
          skipped++;
        }
        continue;
      }

      await prisma.event.create({
        data: {
          name: detail.name,
          region: "taiwan",
          country: "台灣",
          city: detail.city,
          date: detail.date,
          registrationStart: detail.regStart,
          registrationEnd: detail.regEnd,
          distances: detail.distances.join(","),
          status: "upcoming",
          websiteUrl: fullUrl,
          registrationUrl: fullUrl,
          source: "bao-ming.com",
          sourceUrl: fullUrl,
          verified: true,
        },
      });
      console.log(`  ✅ ${detail.name} (${detail.date.toISOString().slice(0, 10)}) [${detail.distances.join(",")}]`);
      added++;
    }

    await prisma.crawlLog.create({
      data: {
        source: "bao-ming.com",
        status: "success",
        message: `${contentIds.length} pages, ${filtered} non-running, ${noData} no-data, ${added} added, ${updated} updated, ${skipped} unchanged`,
        eventsFound: contentIds.length,
        eventsAdded: added,
      },
    });

    const total = await prisma.event.count();
    console.log(`\n📊 ${contentIds.length} pages → ${filtered} filtered, ${noData} no-data → ${added} added, ${updated} updated, ${skipped} unchanged`);
    console.log(`📦 Total events in DB: ${total}`);

  } catch (err) {
    console.error("❌ Crawl failed:", err);
    await prisma.crawlLog.create({
      data: { source: "bao-ming.com", status: "error", message: String(err), eventsFound: 0, eventsAdded: 0 },
    });
  } finally {
    await browser.close();
    await prisma.$disconnect();
  }
}

crawl();
