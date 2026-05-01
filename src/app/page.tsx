"use client";

import { useState, useEffect } from "react";
import ThemeGlass from "@/components/themes/ThemeGlass";
import ThemeRetro1 from "@/components/themes/ThemeRetro1";
import ThemeRetro2 from "@/components/themes/ThemeRetro2";
import ThemeRetro3 from "@/components/themes/ThemeRetro3";
import ThemeRetroRPG from "@/components/themes/ThemeRetroRPG";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [truyenData, setTruyenData] = useState<{
    title: string;
    chunks: string[];
    nextUrl: string | null;
    prevUrl: string | null;
  } | null>(null);

  // Giao diện (Theme)
  const [theme, setTheme] = useState("glass");
  const [themeOpen, setThemeOpen] = useState(false);
  const [history, setHistory] = useState<{title: string, url: string} | null>(null);

  useEffect(() => {
    // Load ưu tiên theme từ máy
    const t = localStorage.getItem("audio_truyen_theme");
    if (t) setTheme(t);

    const h = localStorage.getItem("audio_truyen_history");
    if (h) {
      try {
        setHistory(JSON.parse(h));
      } catch(e) {}
    }
  }, []);

  const changeTheme = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem("audio_truyen_theme", newTheme);
    setThemeOpen(false);
  };

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
        prevUrl: payload.data.prevUrl,
      });
      setUrl(targetUrl);

      const navHistory = { title: payload.data.title, url: targetUrl };
      setHistory(navHistory);
      localStorage.setItem("audio_truyen_history", JSON.stringify(navHistory));
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNextChapter = (nextUrl: string) => {
    fetchTruyen(nextUrl);
  };

  const handlePrevChapter = (prevUrl: string) => {
    fetchTruyen(prevUrl);
  };

  const handleRefresh = () => {
    if (url) fetchTruyen(url);
  };

  // Khởi tạo Lõi Phần Cứng: Audio Node
  const audioState = useAudioPlayer(truyenData?.title, url, truyenData?.nextUrl, handleNextChapter);

  // Đóng gói Props đẩy xuống Theme render
  const themeProps = {
    url,
    setUrl,
    loading,
    error,
    truyenData,
    fetchTruyen,
    handleNextChapter,
    handlePrevChapter,
    handleRefresh,
    onBack: () => setTruyenData(null),
    audioState,
    setThemeOpen,
    history
  };

  return (
    <>
      {/* KHÔNG THỂ BỊ NGẮT MẠCH: Thẻ audio luôn chìm dưới đáy không phụ thuộc vào Theme */}
      <audio {...audioState.audioProps} />
      
      {/* CƠ CHẾ CHẠY NGẦM: Tự động preload tập tiếp theo để không phải chờ */}
      {truyenData?.nextUrl && (
        <audio 
          src={`/api/tts-chapter?url=${encodeURIComponent(truyenData.nextUrl)}`} 
          preload="auto" 
          className="hidden" 
          muted 
        />
      )}
      
      {/* MÀN HÌNH ĐỔI THEME TRÊN TOÀN CỤC */}
      {themeOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#111125] border border-white/20 p-6 w-full max-w-sm shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-y-auto max-h-[90vh]">
            <h3 className="text-white font-bold text-center mb-6 tracking-widest uppercase">CHỌN PHONG CÁCH KHẾ ƯỚC</h3>
            <div className="space-y-4">
              <button 
                onClick={() => changeTheme('glass')} 
                className={`w-full p-4 border transition-all uppercase tracking-widest text-sm font-bold ${theme === 'glass' ? 'bg-white/20 border-white text-white' : 'border-white/20 text-white/50 hover:bg-white/10'}`}
              >
                1. Hệ Thống Pha Lê (Original)
              </button>
              <button 
                onClick={() => changeTheme('retro1')} 
                className={`w-full p-4 border transition-all uppercase tracking-widest text-sm font-bold ${theme === 'retro1' ? 'bg-[#ffb778]/20 border-[#ffb778] text-[#ffb778]' : 'border-[#ffb778]/30 text-[#ffb778]/50 hover:bg-[#ffb778]/10'}`}
              >
                2. Không Gian Nạp Thẻ (Retro 1)
              </button>
              <button 
                onClick={() => changeTheme('retro2')} 
                className={`w-full p-4 border transition-all uppercase tracking-widest text-sm font-bold ${theme === 'retro2' ? 'bg-[#00f0ff]/20 border-[#00f0ff] text-[#00f0ff]' : 'border-[#00f0ff]/30 text-[#00f0ff]/50 hover:bg-[#00f0ff]/10'}`}
              >
                3. Hầm Ngục Manhwa (Archive)
              </button>
              <button 
                onClick={() => changeTheme('retro3')} 
                className={`w-full p-4 border transition-all uppercase tracking-widest text-sm font-bold ${theme === 'retro3' ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37]' : 'border-[#d4af37]/30 text-[#d4af37]/50 hover:bg-[#d4af37]/10'}`}
              >
                4. Tàng Kinh Các (Cổ Đại)
              </button>
              <button 
                onClick={() => changeTheme('retrorpg')} 
                className={`w-full p-4 border transition-all uppercase tracking-widest text-sm font-bold ${theme === 'retrorpg' ? 'bg-[#39ff14]/20 border-[#39ff14] text-[#39ff14]' : 'border-[#39ff14]/30 text-[#39ff14]/50 hover:bg-[#39ff14]/10'}`}
              >
                5. Dungeon Đỏ Đen (RPG)
              </button>
            </div>
            <button onClick={() => setThemeOpen(false)} className="mt-8 w-full text-center text-white/30 hover:text-white text-xs font-bold tracking-widest transition-colors">
              ĐÓNG [ X ]
            </button>
          </div>
        </div>
      )}

      {/* RENDER KHUNG BẢO VỆ MOBILE FRAME */}
      <main className="flex min-h-[100dvh] flex-col items-center justify-center py-4 bg-slate-950 relative font-sans overflow-hidden">
        {/* Background ambient light for Desktop */}
        <div className="absolute top-1/4 left-[10%] w-80 h-80 bg-indigo-600/10 rounded-full mix-blend-screen filter blur-[100px] pointer-events-none hidden md:block" />
        <div className="absolute bottom-1/4 right-[10%] w-96 h-96 bg-[#ff6600]/10 rounded-full mix-blend-screen filter blur-[120px] pointer-events-none hidden md:block" />
        
        {/* KHUNG GIỚI HẠN 400px CHO MỌI THEME */}
         <div className="w-full max-w-[400px] h-full sm:h-[90vh] sm:max-h-[850px] sm:min-h-[750px] rounded-none sm:rounded-[2.5rem] overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] relative z-10 flex flex-col shrink-0 border-0 sm:border border-white/10" style={{ isolation: 'isolate' }}>
            {theme === "glass" && <ThemeGlass {...themeProps} />}
            {theme === "retro1" && <ThemeRetro1 {...themeProps} />}
            {theme === "retro2" && <ThemeRetro2 {...themeProps} />}
            {theme === "retro3" && <ThemeRetro3 {...themeProps} />}
            {theme === "retrorpg" && <ThemeRetroRPG {...themeProps} />}
         </div>
      </main>
    </>
  );
}
