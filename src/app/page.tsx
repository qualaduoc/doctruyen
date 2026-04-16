"use client";

import { useState, useEffect } from "react";
import ThemeGlass from "@/components/themes/ThemeGlass";
import ThemeRetro1 from "@/components/themes/ThemeRetro1";
import ThemeRetro2 from "@/components/themes/ThemeRetro2";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [truyenData, setTruyenData] = useState<{
    title: string;
    chunks: string[];
    nextUrl: string | null;
  } | null>(null);

  // Giao diện (Theme)
  const [theme, setTheme] = useState("glass");
  const [themeOpen, setThemeOpen] = useState(false);

  useEffect(() => {
    // Load ưu tiên theme từ máy
    const t = localStorage.getItem("audio_truyen_theme");
    if (t) setTheme(t);
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

  // Khởi tạo Lõi Phần Cứng: Audio Node
  const audioState = useAudioPlayer(truyenData?.title, url, handleNextChapter);

  // Đóng gói Props đẩy xuống Theme render
  const themeProps = {
    url,
    setUrl,
    loading,
    error,
    truyenData,
    fetchTruyen,
    handleNextChapter,
    onBack: () => setTruyenData(null),
    audioState,
    setThemeOpen
  };

  return (
    <>
      {/* KHÔNG THỂ BỊ NGẮT MẠCH: Thẻ audio luôn chìm dưới đáy không phụ thuộc vào Theme */}
      <audio {...audioState.audioProps} />
      
      {/* MÀN HÌNH ĐỔI THEME TRÊN TOÀN CỤC */}
      {themeOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#111125] border border-white/20 p-6 w-full max-w-sm shadow-[0_0_50px_rgba(0,0,0,0.8)]">
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
            </div>
            <button onClick={() => setThemeOpen(false)} className="mt-8 w-full text-center text-white/30 hover:text-white text-xs font-bold tracking-widest transition-colors">
              ĐÓNG [ X ]
            </button>
          </div>
        </div>
      )}

      {/* RENDER DỰA THEO STATE NHẰM GIỮ LUỒNG NHẠC MỘT CÁCH TRƠN TRU NHẤT */}
      {theme === "glass" && <ThemeGlass {...themeProps} />}
      {theme === "retro1" && <ThemeRetro1 {...themeProps} />}
      {theme === "retro2" && <ThemeRetro2 {...themeProps} />}
    </>
  );
}
