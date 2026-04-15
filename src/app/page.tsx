"use client";

import { useState } from "react";
import AudioPlayer from "@/components/AudioPlayer";
import { Headphones, Loader2, Link as LinkIcon, BookOpen, Fingerprint } from "lucide-react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [truyenData, setTruyenData] = useState<{
    title: string;
    chunks: string[];
    nextUrl: string | null;
  } | null>(null);

  const fetchTruyen = async (targetUrl: string) => {
    if (!targetUrl) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/truyen?url=${encodeURIComponent(targetUrl)}`);
      const payload = await res.json();
      
      if (!payload.success) {
        throw new Error(payload.error || "Không thể tải dữ liệu");
      }

      setTruyenData({
        title: payload.data.title,
        chunks: payload.data.chunks,
        nextUrl: payload.data.nextUrl,
      });
      setUrl(targetUrl);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNextChapter = (nextUrl: string) => {
    fetchTruyen(nextUrl);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-slate-950 text-gray-100 relative overflow-hidden font-sans">
      {/* Cầu Quang Phổ (Orbs) làm nền Glassmorphism */}
      <div className="absolute top-1/4 left-[10%] w-80 h-80 bg-indigo-600/30 rounded-full mix-blend-screen filter blur-[100px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-[10%] w-96 h-96 bg-[#ff6600]/20 rounded-full mix-blend-screen filter blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/[0.03] to-transparent pointer-events-none" />

      <div className="w-full max-w-[400px] bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] relative z-10 flex flex-col justify-between" style={{ minHeight: "750px" }}>
        
        {/* Header (Chỉ hiện khi chưa nhập link) */}
        {!truyenData && (
          <div className="p-8 pb-4 flex flex-col items-center mt-8">
            <div className="w-20 h-20 bg-gradient-to-br from-[#ff6600] to-pink-600 rounded-3xl flex items-center justify-center shadow-lg shadow-[#ff6600]/30 mb-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/20 backdrop-blur-md" />
              <Headphones size={36} className="text-white relative z-10" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Omni-Scraper</h1>
            <p className="text-gray-400 text-sm text-center font-medium px-4">Đọc auto mọi loại truyện (Wattpad, TruyenFull, Metruyenchu...)</p>
          </div>
        )}

        {/* Cột mốc nội dung chính */}
        <div className="p-6 flex-1 flex flex-col justify-center">
          {!truyenData ? (
            <div className="space-y-6 w-full max-w-sm mx-auto">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-300 flex items-center gap-2 ml-1">
                  <LinkIcon size={16} className="text-[#ff6600]" /> Dán Link Truyện Nơi Đây
                </label>
                <div className="relative">
                  <input
                    type="url"
                    className="w-full pl-5 pr-12 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#ff6600]/50 transition-all text-white placeholder:text-gray-500 backdrop-blur-sm"
                    placeholder="https://..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                     <Fingerprint size={20} className={url ? "text-[#ff6600]" : "text-gray-600"} />
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 backdrop-blur-md rounded-2xl text-red-400 text-sm font-medium text-center shadow-inner">
                  {error}
                </div>
              )}

              <button
                onClick={() => fetchTruyen(url)}
                disabled={loading || !url}
                className="w-full py-4 mt-4 bg-white/10 hover:bg-white/20 border border-white/20 disabled:opacity-50 text-white rounded-2xl font-bold transition-all flex justify-center items-center gap-2 backdrop-blur-md relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ff6600]/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                {loading ? (
                  <>
                    <Loader2 className="animate-spin relative z-10" size={20} /> <span className="relative z-10">Đang vét máng dữ liệu...</span>
                  </>
                ) : (
                  <>
                    <BookOpen size={20} className="relative z-10" /> <span className="relative z-10 text-[#ff6600]">Nghe Audio Chứ Lì</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <AudioPlayer 
              title={truyenData.title}
              chunks={truyenData.chunks}
              nextUrl={truyenData.nextUrl}
              onNextChapter={handleNextChapter}
              onBack={() => setTruyenData(null)}
            />
          )}
        </div>
      </div>
    </main>
  );
}
