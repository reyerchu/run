import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatDate, formatEstimatedDate, daysUntil, getStatusLabel, computeEventStatus, parseDistances } from "@/lib/utils";
import Link from "next/link";
import { Flag, CalendarClock, Heart } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EventDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      photos: { include: { user: { select: { name: true, image: true } } }, orderBy: { createdAt: "desc" }, take: 20 },
      reviews: { include: { user: { select: { name: true, image: true } } }, orderBy: { createdAt: "desc" }, take: 20 },
      _count: { select: { favorites: true } },
    },
  });

  if (!event) notFound();

  const computedStatus = computeEventStatus(event);
  const { label, color } = getStatusLabel(computedStatus);
  const distances = parseDistances(event.distances);
  const isExpected = computedStatus === "expected";
  const isCompleted = computedStatus === "completed";
  const daysToRace = isExpected ? null : daysUntil(event.date);

  return (
    <section className="section-padding">
      <div className="container-narrow max-w-4xl">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-gray-400">
          <Link href="/" className="hover:text-emerald-600">首頁</Link>
          <span className="mx-2">/</span>
          <Link href={event.region === "taiwan" ? "/taiwan" : "/international"} className="hover:text-emerald-600">
            {event.region === "taiwan" ? "台灣賽事" : "國際賽事"}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-600">{event.name}</span>
        </nav>

        {/* Header */}
        <div className="flex flex-wrap items-start gap-4 mb-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">{event.name}</h1>
            {event.nameEn && <p className="mt-1 text-lg text-gray-400 leading-7 text-pretty max-w-[45ch]">{event.nameEn}</p>}
          </div>
          <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full text-white" style={{ backgroundColor: color }}>{label}</span>
        </div>

        {/* Info grid */}
        <div className="rounded-xl bg-gray-950/[2.5%] ring-1 ring-inset ring-gray-950/5 p-6 mb-8">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <div className="text-sm text-gray-400 mb-1 leading-7">比賽日期</div>
              <div className="font-semibold">
                {isExpected
                  ? formatEstimatedDate(event.estimatedMonth ?? null, event.date)
                  : formatDate(event.date)}
              </div>
              {!isExpected && daysToRace !== null && daysToRace > 0 && <div className="text-sm text-emerald-600 leading-7">{daysToRace} 天後</div>}
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1 leading-7">地點</div>
              <div className="font-semibold">{event.city}{event.country ? `, ${event.country}` : ""}</div>
            </div>
            {isExpected ? (
              <div>
                <div className="text-sm text-gray-400 mb-1 leading-7">報名時間</div>
                <div className="font-semibold text-amber-600">尚未公布</div>
              </div>
            ) : (
              <>
                {event.registrationStart && (
                  <div>
                    <div className="text-sm text-gray-400 mb-1 leading-7">報名開始</div>
                    <div className="font-semibold">{formatDate(event.registrationStart)}</div>
                  </div>
                )}
                {event.registrationEnd && (
                  <div>
                    <div className="text-sm text-gray-400 mb-1 leading-7">報名截止</div>
                    <div className="font-semibold">{formatDate(event.registrationEnd)}</div>
                    {daysUntil(event.registrationEnd) > 0 && (
                      <div className="text-sm text-orange-500 leading-7">剩餘 {daysUntil(event.registrationEnd)} 天</div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Distances */}
          <div className="mt-6">
            <div className="text-sm text-gray-400 mb-2 leading-7">比賽距離</div>
            <div className="flex flex-wrap gap-2">
              {distances.map((d) => (
                <span key={d} className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-white ring-1 ring-gray-950/10 text-gray-700 shadow-sm">{d}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Status banners */}
        {isCompleted && (
          <div className="rounded-lg bg-gray-950/[2.5%] ring-1 ring-inset ring-gray-950/10 p-4 mb-8">
            <p className="text-sm text-gray-600 leading-7 text-pretty flex items-center">
              <Flag className="h-4 w-4 text-gray-600 mr-1" /> 此賽事已於 {formatDate(event.date)} 完賽。以下資訊僅供參考。
            </p>
          </div>
        )}
        {isExpected && (
          <div className="rounded-lg bg-amber-950/[2.5%] ring-1 ring-inset ring-amber-500/20 p-4 mb-8">
            <p className="text-sm text-amber-700 leading-7 text-pretty max-w-[55ch] flex items-start">
              <CalendarClock className="h-4 w-4 text-amber-700 mr-1 mt-0.5 flex-shrink-0" /> 此為週期性賽事，依據往年慣例推估舉辦時間。實際日期、報名方式及費用以主辦單位正式公告為準。
            </p>
          </div>
        )}

        {/* Description */}
        {event.description && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3 tracking-tight">賽事簡介</h2>
            <p className="text-gray-600 leading-7 text-pretty max-w-[60ch]">{event.description}</p>
          </div>
        )}

        {/* Links */}
        <div className="flex flex-wrap gap-3 mb-12">
          {event.websiteUrl && (
            <a
              href={event.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-full bg-gray-900 text-white ring-1 ring-gray-900/10 shadow-sm hover:bg-gray-700 transition-colors"
            >
              官方網站
            </a>
          )}
          {event.registrationUrl && !isCompleted && computedStatus !== "closed" && (
            <a
              href={event.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-full bg-emerald-500 text-white ring-1 ring-emerald-500/10 shadow-sm hover:bg-emerald-400 transition-colors"
            >
              前往報名
            </a>
          )}
        </div>

        {/* Reviews */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold mb-4 tracking-tight">跑者心得 ({event.reviews.length})</h2>
          {event.reviews.length === 0 ? (
            <p className="text-gray-400 text-sm leading-7">尚無心得分享，成為第一個分享的跑者吧！</p>
          ) : (
            <div className="space-y-4">
              {event.reviews.map((r) => (
                <div key={r.id} className="rounded-lg bg-gray-950/[2.5%] ring-1 ring-inset ring-gray-950/5 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-sm">{r.user.name}</span>
                    <span className="text-yellow-500 text-sm">{"⭐".repeat(r.rating)}</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-7 text-pretty">{r.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Photos */}
        <div>
          <h2 className="text-lg font-semibold mb-4 tracking-tight">照片牆 ({event.photos.length})</h2>
          {event.photos.length === 0 ? (
            <p className="text-gray-400 text-sm leading-7">尚無照片，快來上傳你的比賽照片！</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {event.photos.map((p) => (
                <div key={p.id} className="aspect-square rounded-lg overflow-hidden bg-gray-100 ring-1 ring-gray-950/10 shadow-sm">
                  <img src={p.imageUrl} alt={p.caption || ""} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Favorite count */}
        <div className="mt-8 text-center text-sm text-gray-400 flex items-center justify-center">
          <Heart className="h-4 w-4 text-gray-400 mr-1" /> {event._count.favorites} 人收藏此賽事
        </div>
      </div>
    </section>
  );
}
