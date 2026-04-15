"use client";

import { useState } from "react";
import AudioPlayer from "@/components/AudioPlayer";
import { Headphones, Loader2, Link as LinkIcon, BookOpen } from "lucide-react";

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
      // Optionally update URL input to show currently playing chapter link if it auto-nexts
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
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-black text-gray-100">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="bg-[#ff6600]/10 p-6 flex flex-col items-center border-b border-[#ff6600]/20">
          <div className="w-16 h-16 bg-[#ff6600]/20 rounded-full flex items-center justify-center mb-4 text-[#ff6600]">
            <Headphones size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Audio-Truyen</h1>
          <p className="text-[#ff6600] text-sm mt-1 font-medium">Auto Next Chapter & Screen-off TTS</p>
        </div>

        {/* Cột mốc nội dung chính */}
        <div className="p-6">
          {!truyenData ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <LinkIcon size={16} /> Link Wattpad
                </label>
                <input
                  type="url"
                  className="w-full px-4 py-3 bg-black border border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff6600] transition-all text-white placeholder:text-gray-600"
                  placeholder="Dán link Wattpad vào đây..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={() => fetchTruyen(url)}
                disabled={loading || !url}
                className="w-full py-4 bg-[#ff6600] hover:bg-[#ff6600]/90 disabled:opacity-50 disabled:hover:bg-[#ff6600] text-white rounded-xl font-bold transition-all flex justify-center items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} /> Đang tải truyện...
                  </>
                ) : (
                  <>
                    <BookOpen size={20} /> Bắt đầu nghe
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
