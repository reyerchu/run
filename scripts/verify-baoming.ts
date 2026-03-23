import puppeteer from "puppeteer";

// Verify all bao-ming.com events by scraping #reg tab for each
const contentIds = [
  "6917", "6798", "6925", "6926", "6892", "6852", "6839", "6905",
  "6725", "6858", "6808", "6923", "6827", "6949", "6906", "6887",
  "6733", "6803", "6891"
];

function parseRocOrAdDate(text: string): string | null {
  const roc = text.match(/民國\s*(\d{2,3})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日/);
  if (roc) { const y = +roc[1] + 1911; return `${y}-${String(+roc[2]).padStart(2,'0')}-${String(+roc[3]).padStart(2,'0')}`; }
  const ad = text.match(/(20\d{2})年\s*(\d{1,2})月\s*(\d{1,2})日/);
  if (ad) return `${ad[1]}-${String(+ad[2]).padStart(2,'0')}-${String(+ad[3]).padStart(2,'0')}`;
  const slash = text.match(/(20\d{2})[-\/](\d{1,2})[-\/](\d{1,2})/);
  if (slash) return `${slash[1]}-${String(+slash[2]).padStart(2,'0')}-${String(+slash[3]).padStart(2,'0')}`;
  const rocShort = text.match(/(\d{2,3})年\s*(\d{1,2})月\s*(\d{1,2})日/);
  if (rocShort && +rocShort[1] >= 100 && +rocShort[1] < 200) { const y = +rocShort[1] + 1911; return `${y}-${String(+rocShort[2]).padStart(2,'0')}-${String(+rocShort[3]).padStart(2,'0')}`; }
  return null;
}

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-blink-features=AutomationControlled"],
  });
  const page = await browser.newPage();
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
  });

  for (const id of contentIds) {
    // Try #reg tab first (has structured data), fallback to #grade
    await page.goto(`https://bao-ming.com/eb/content/${id}#reg`, { waitUntil: "networkidle2", timeout: 20000 });
    await new Promise(r => setTimeout(r, 3000));
    
    let text = await page.evaluate(() => (document.body?.innerText || "").replace(/\s+/g, " "));
    
    // If #reg doesn't have date info, try #grade
    if (!text.includes("活動日期") && !text.includes("比賽日期") && !text.includes("競賽日期")) {
      await page.goto(`https://bao-ming.com/eb/content/${id}#grade`, { waitUntil: "networkidle2", timeout: 20000 });
      await new Promise(r => setTimeout(r, 3000));
      text = await page.evaluate(() => (document.body?.innerText || "").replace(/\s+/g, " "));
    }

    const title = await page.evaluate(() => {
      const t = document.title?.trim() || "";
      return t.replace(/^[^-–]+[-–]\s*/, "").trim();
    });

    // Extract date
    let eventDate: string | null = null;
    const dateLabels = ["活動日期", "比賽日期", "賽事日期", "競賽日期"];
    for (const label of dateLabels) {
      const m = text.match(new RegExp(label + "[：:\\s]*(.{5,120})"));
      if (m) { eventDate = parseRocOrAdDate(m[1]); if (eventDate) break; }
    }
    if (!eventDate) eventDate = parseRocOrAdDate(text);

    // Extract location
    let location = "";
    const locLabels = ["活動地點", "集合地點", "比賽地點", "競賽主場地", "起跑地點"];
    for (const label of locLabels) {
      const m = text.match(new RegExp(label + "[：:\\s]*(.{3,80})"));
      if (m) { location = m[1].split(/[。，,\n]/)[0].trim(); break; }
    }

    // Extract distances from 比賽/競賽項目 section
    const distSection = text.replace(/\n/g, " ").match(/(?:比賽|競賽)(?:項目|組別|路線)(.{0,500}?)(?:報名|活動|注意|備註|集合)/)?.[1] || "";
    const dists: string[] = [];
    const checks: Array<[RegExp, string]> = [
      [/全[馬程]|42\.?195|43公里/i, "全馬"], [/半[馬程]|21\.?[05]?[kK公]|21\.5/i, "半馬"],
      [/10[kK公]/i, "10K"], [/5[kK公]/i, "5K"], [/6[kK公]/i, "6K"], [/3[\.k5K公]/i, "3K"],
      [/越野/i, "越野"], [/健走|健行/i, "健走"], [/超馬|100[kK]|50[kK]/i, "超馬"],
    ];
    checks.forEach(([p, label]) => { if (p.test(distSection) || p.test(title)) if (!dists.includes(label)) dists.push(label); });

    // Registration dates
    let regStart: string | null = null;
    let regEnd: string | null = null;
    const regSec = text.match(/報名(?:起訖|日期|時間)[：:\s]*(.{10,300})/);
    if (regSec) {
      const allDates = regSec[1].match(/\d{4}[-\/]\d{1,2}[-\/]\d{1,2}|\d{2,3}年\s*\d{1,2}月\s*\d{1,2}日|\d{4}年\s*\d{1,2}月\s*\d{1,2}日/g);
      if (allDates && allDates.length >= 1) regStart = parseRocOrAdDate(allDates[0]);
      if (allDates && allDates.length >= 2) regEnd = parseRocOrAdDate(allDates[1]);
    }

    console.log(`${id} | ${title} | date:${eventDate || '?'} | loc:${location || '?'} | dist:${dists.join(',') || '?'} | reg:${regStart || '?'}~${regEnd || '?'}`);
  }

  await browser.close();
})();
