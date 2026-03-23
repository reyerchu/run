# 🏃 Runner Will Guide

> **Runner will, your guide.** 為每位跑者找到下一場賽事

🌐 **https://runner.will.guide**

## 功能

- 🇹🇼 **台灣賽事** — 全台路跑賽事一覽，篩選月份/距離/報名狀態
- 🌍 **國際賽事** — 世界各地馬拉松資訊，含時區說明
- 📅 **行事曆** — 月曆檢視所有賽事時間
- 🔍 **搜尋篩選** — 依月份、距離、狀態、關鍵字快速找賽事
- 👤 **跑者儀表板** — 個人檔案、跑步紀錄管理
- 📋 **紀錄詳情** — 完賽紀錄詳細頁面，含距離、時間、名次、心得
- 🏅 **完賽證書** — 上傳證書圖片或貼上證書連結
- 🔎 **賽事搜尋** — 新增紀錄時自動搜尋賽事，選擇後自動帶入資料
- 🤖 **自動爬蟲** — 每日從 bao-ming.com 抓取最新賽事（每天 03:00）

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Database:** SQLite + Prisma 5
- **Auth:** NextAuth.js (Google OAuth + Email/Password)
- **Icons:** Lucide React
- **Crawler:** Puppeteer (bao-ming.com)
- **Deployment:** PM2 + Apache reverse proxy + Let's Encrypt SSL

## Getting Started

```bash
# Install
npm install

# Setup database
npx prisma generate
npx prisma db push

# Copy env
cp .env.example .env
# Edit .env with your credentials

# Dev
npm run dev

# Production
npm run build
pm2 start npm --name runner-will-guide -- start
```

## Crawler

```bash
# Run manually
npx ts-node scripts/crawlers/baoming.ts

# Automated: cron job runs daily at 03:00 AM (Asia/Taipei)
```

## Architecture

```
External → 8HD-A (Apache/SSL) → 8HD-8 (Next.js :3849)
```

- **runner.will.guide** — production
- **run.will.guide** — alias (same app)

## Changelog

### v0.03 (2026-03-24)
- 完賽證書功能：上傳圖片 + 貼上連結
- 紀錄詳情頁面 `/dashboard/records/[id]`
- 賽事搜尋 autocomplete（新增紀錄時自動帶入賽事資料）
- 競賽編號 (bibNumber) 欄位
- 距離自動帶精確公里數（42K→42.195 等）
- 動態檔案 API serve（Next.js build 後上傳的檔案）

### v0.02 (2026-03-24)
- 品牌重塑：Marathon Board → Runner Will Guide
- 全站 emoji → Lucide React icons
- RY-UI-skill 設計規範套用
- Dashboard UI 重寫（總覽、紀錄、個人檔案）
- 爬蟲改為每日執行

### v0.01 (2026-03-23)
- 初始版本：賽事列表、行事曆、爬蟲、Dashboard

## License

MIT

---

Built with ❤️ by [will.guide](https://will.guide)
