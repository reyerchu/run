"use client";

import { useState, useRef } from "react";
import { Star, Send, ImagePlus, Loader2, Heart } from "lucide-react";

interface ReviewData {
  id: string;
  content: string;
  rating: number;
  createdAt: string;
  user: { name: string | null; image: string | null };
}

interface PhotoData {
  id: string;
  imageUrl: string;
  caption: string | null;
  createdAt: string;
  user: { name: string | null; image: string | null };
}

interface Props {
  eventId: string;
  initialReviews: ReviewData[];
  initialPhotos: PhotoData[];
  isLoggedIn: boolean;
  initialFavorited: boolean;
  initialFavoriteCount: number;
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}
          className="p-0.5 transition-colors"
        >
          <Star
            className="h-5 w-5"
            fill={(hover || value) >= i ? "#eab308" : "none"}
            stroke={(hover || value) >= i ? "#eab308" : "#d1d5db"}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
}

export default function EventDetailClient({ eventId, initialReviews, initialPhotos, isLoggedIn, initialFavorited, initialFavoriteCount }: Props) {
  const [reviews, setReviews] = useState<ReviewData[]>(initialReviews);
  const [photos, setPhotos] = useState<PhotoData[]>(initialPhotos);

  // Favorite
  const [favorited, setFavorited] = useState(initialFavorited);
  const [favoriteCount, setFavoriteCount] = useState(initialFavoriteCount);
  const [favLoading, setFavLoading] = useState(false);

  // Review form
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [reviewLoading, setReviewLoading] = useState(false);

  // Photo form
  const [caption, setCaption] = useState("");
  const [photoLoading, setPhotoLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function submitReview() {
    if (!content.trim() || rating === 0) return;
    setReviewLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim(), rating }),
      });
      if (res.ok) {
        const newReview = await res.json();
        setReviews((prev) => [newReview, ...prev]);
        setContent("");
        setRating(0);
      }
    } finally {
      setReviewLoading(false);
    }
  }

  async function submitPhoto() {
    if (!selectedFile) return;
    setPhotoLoading(true);
    try {
      const fd = new FormData();
      fd.append("image", selectedFile);
      if (caption.trim()) fd.append("caption", caption.trim());
      const res = await fetch(`/api/events/${eventId}/photos`, {
        method: "POST",
        body: fd,
      });
      if (res.ok) {
        const newPhoto = await res.json();
        setPhotos((prev) => [newPhoto, ...prev]);
        setCaption("");
        setSelectedFile(null);
        setPreview(null);
        if (fileRef.current) fileRef.current.value = "";
      }
    } finally {
      setPhotoLoading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  }

  async function toggleFavorite() {
    if (!isLoggedIn) return;
    setFavLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/favorite`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setFavorited(data.favorited);
        setFavoriteCount(data.count);
      }
    } finally {
      setFavLoading(false);
    }
  }

  return (
    <>
      {/* Favorite Button */}
      <div className="mb-12 flex items-center gap-3">
        {isLoggedIn ? (
          <button
            onClick={toggleFavorite}
            disabled={favLoading}
            className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-full ring-1 shadow-sm transition-colors ${
              favorited
                ? "bg-red-50 text-red-600 ring-red-200 hover:bg-red-100"
                : "bg-white text-gray-600 ring-gray-950/10 hover:bg-gray-50"
            } disabled:opacity-50`}
          >
            <Heart
              className="h-4 w-4"
              fill={favorited ? "currentColor" : "none"}
            />
            {favorited ? "已收藏" : "收藏"}
          </button>
        ) : (
          <div className="inline-flex items-center gap-2 px-5 py-2.5 text-sm text-gray-400 rounded-full ring-1 ring-gray-950/5 bg-gray-950/[2.5%]">
            <Heart className="h-4 w-4" />
            <a href="/login" className="text-emerald-600 hover:underline">登入</a>後即可收藏
          </div>
        )}
        <span className="text-sm text-gray-400">{favoriteCount} 人收藏</span>
      </div>

      {/* Reviews Section */}
      <div className="mb-12">
        <h2 className="text-lg font-semibold mb-4 tracking-tight">跑者心得 ({reviews.length})</h2>

        {/* Review Form */}
        {isLoggedIn ? (
          <div className="rounded-xl ring-1 ring-gray-950/5 shadow-sm p-5 mb-6 bg-white">
            <div className="mb-3">
              <label className="text-sm text-gray-600 mb-1.5 block">評分</label>
              <StarRating value={rating} onChange={setRating} />
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="分享您的跑步心得..."
              rows={3}
              className="w-full rounded-xl ring-1 ring-gray-950/5 px-4 py-3 text-sm text-gray-950 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-none"
            />
            <div className="flex justify-end mt-3">
              <button
                onClick={submitReview}
                disabled={reviewLoading || !content.trim() || rating === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full bg-emerald-500 text-white ring-1 ring-emerald-500/10 shadow-sm hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {reviewLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                發表心得
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-xl ring-1 ring-gray-950/5 p-4 mb-6 bg-gray-950/[2.5%]">
            <p className="text-sm text-gray-400">
              <a href="/login" className="text-emerald-600 hover:underline">登入</a>後即可分享心得
            </p>
          </div>
        )}

        {reviews.length === 0 ? (
          <p className="text-gray-400 text-sm leading-7">尚無心得分享，成為第一個分享的跑者吧！</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-xl bg-gray-950/[2.5%] ring-1 ring-inset ring-gray-950/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-sm text-gray-950">{r.user.name}</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-3.5 w-3.5" fill={i <= r.rating ? "#eab308" : "none"} stroke={i <= r.rating ? "#eab308" : "#d1d5db"} strokeWidth={1.5} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-7 text-pretty">{r.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Photos Section */}
      <div>
        <h2 className="text-lg font-semibold mb-4 tracking-tight">照片牆 ({photos.length})</h2>

        {/* Photo Upload Form */}
        {isLoggedIn ? (
          <div className="rounded-xl ring-1 ring-gray-950/5 shadow-sm p-5 mb-6 bg-white">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            {preview ? (
              <div className="mb-3">
                <div className="relative w-40 h-40 rounded-xl overflow-hidden ring-1 ring-gray-950/5">
                  <img src={preview} alt="預覽" className="w-full h-full object-cover" />
                  <button
                    onClick={() => { setSelectedFile(null); setPreview(null); if (fileRef.current) fileRef.current.value = ""; }}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 text-white text-xs flex items-center justify-center hover:bg-black/70"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full rounded-xl border-2 border-dashed border-gray-200 hover:border-emerald-300 p-8 flex flex-col items-center gap-2 transition-colors mb-3"
              >
                <ImagePlus className="h-8 w-8 text-gray-300" />
                <span className="text-sm text-gray-400">點擊選擇照片</span>
              </button>
            )}
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="照片說明（選填）"
              className="w-full rounded-xl ring-1 ring-gray-950/5 px-4 py-2.5 text-sm text-gray-950 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
            <div className="flex justify-end mt-3">
              <button
                onClick={submitPhoto}
                disabled={photoLoading || !selectedFile}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full bg-emerald-500 text-white ring-1 ring-emerald-500/10 shadow-sm hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {photoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                上傳照片
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-xl ring-1 ring-gray-950/5 p-4 mb-6 bg-gray-950/[2.5%]">
            <p className="text-sm text-gray-400">
              <a href="/login" className="text-emerald-600 hover:underline">登入</a>後即可上傳照片
            </p>
          </div>
        )}

        {photos.length === 0 ? (
          <p className="text-gray-400 text-sm leading-7">尚無照片，快來上傳您的比賽照片！</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {photos.map((p) => (
              <div key={p.id} className="group">
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 ring-1 ring-gray-950/10 shadow-sm">
                  <img src={p.imageUrl} alt={p.caption || ""} className="w-full h-full object-cover" />
                </div>
                {p.caption && <p className="mt-1.5 text-xs text-gray-500 truncate">{p.caption}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
