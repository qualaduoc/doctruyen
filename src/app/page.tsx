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

  const [theme, setTheme] = useState("glass");
  const [themeOpen, setThemeOpen] = useState(false);
  const [history, setHistory] = useState<{title: string, url: string} | null>(null);

  // Thêm state cho Tủ sách & Giọng đọc
  const [bookshelfOpen, setBookshelfOpen] = useState(false);
  const [fullHistory, setFullHistory] = useState<any[]>([]);
  const [voice, setVoice] = useState("google");

  // Thêm state cho preload UI
  const [preloadDepth, setPreloadDepth] = useState<number>(1);
  const [preloadUrls, setPreloadUrls] = useState<string[]>([]);
  const [loadedAudios, setLoadedAudios] = useState<Set<string>>(new Set());
  const [loadedBytes, setLoadedBytes] = useState<number>(0);
  const [preloadStatus, setPreloadStatus] = useState<'idle'|'loading'|'done'>('idle');

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0MB';
    return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
  };

  useEffect(() => {
    // Load ưu tiên theme từ máy
    const t = localStorage.getItem("audio_truyen_theme");
    if (t) setTheme(t);

    const v = localStorage.getItem("audio_truyen_voice");
    if (v) setVoice(v);

    const d = localStorage.getItem("audio_preload_depth");
    if (d) setPreloadDepth(Number(d));

    const h2 = localStorage.getItem("audio_truyen_history_v2");
    if (h2) {
      try {
        const arr = JSON.parse(h2);
        if (Array.isArray(arr) && arr.length > 0) setHistory(arr[0]);
      } catch(e) {}
    } else {
      const h = localStorage.getItem("audio_truyen_history");
      if (h) {
        try { setHistory(JSON.parse(h)); } catch(e) {}
      }
    }
  }, []);

  const changeTheme = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem("audio_truyen_theme", newTheme);
    setThemeOpen(false);
  };

  const openBookshelf = () => {
    try {
      const arr = JSON.parse(localStorage.getItem("audio_truyen_history_v2") || "[]");
      setFullHistory(Array.isArray(arr) ? arr : []);
    } catch(e) { setFullHistory([]); }
    setBookshelfOpen(true);
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

      // Cập nhật lịch sử với Garbage Collection (tối đa 50 truyện)
      const bookIdMatch = targetUrl.match(/([^/]+)\/chuong/i);
      const bookId = bookIdMatch ? bookIdMatch[1] : targetUrl;
      const navHistory = { id: bookId, title: payload.data.title, url: targetUrl, time: Date.now() };

      setHistory(navHistory);
      
      let hArr: any[] = [];
      try {
        hArr = JSON.parse(localStorage.getItem("audio_truyen_history_v2") || "[]");
        if (!Array.isArray(hArr)) hArr = [];
      } catch(e){}
      
      hArr = hArr.filter((item: any) => item.id !== bookId);
      hArr.unshift(navHistory);
      if (hArr.length > 50) hArr = hArr.slice(0, 50);
      
      localStorage.setItem("audio_truyen_history_v2", JSON.stringify(hArr));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNextChapter = (nextUrl: string) => {
    setUrl(nextUrl);
    fetchTruyen(nextUrl);
  };

  const handlePrevChapter = (prevUrl: string) => {
    setUrl(prevUrl);
    fetchTruyen(prevUrl);
  };

  const handleRefresh = () => {
    if (url) fetchTruyen(url);
  };

  // Logic chạy ngầm lấy text các chương tiếp theo để Preload
  useEffect(() => {
    let isCancelled = false;
    const runPreload = async () => {
      if (!truyenData?.nextUrl) {
         setPreloadStatus('idle');
         setPreloadUrls([]);
         setLoadedAudios(new Set());
         setLoadedBytes(0);
         return;
      }
      
      setPreloadStatus('loading');
      setLoadedAudios(new Set());
      setLoadedBytes(0);
      const urlsToPreload = [truyenData.nextUrl];
      setPreloadUrls([...urlsToPreload]);
  
      let currentHtmlUrl = truyenData.nextUrl;
      // 1. Quét tìm các URL chương tiếp theo
      for (let i = 1; i < preloadDepth; i++) {
         try {
           const res = await fetch(`/api/truyen?url=${encodeURIComponent(currentHtmlUrl)}`);
           const data = await res.json();
           if (isCancelled) return;
           if (data.success && data.data.nextUrl) {
              urlsToPreload.push(data.data.nextUrl);
              setPreloadUrls([...urlsToPreload]);
              currentHtmlUrl = data.data.nextUrl;
           } else {
              break;
           }
         } catch (e) {
           break;
         }
      }

      // 2. Fetch ép tải toàn bộ MP3 vào Disk Cache với cơ chế Retry x3
      for (const u of urlsToPreload) {
         if (isCancelled) return;
         let retries = 3;
         let success = false;

         while (retries > 0 && !success) {
            if (isCancelled) return;
            try {
               const audioUrl = `/api/tts-chapter?url=${encodeURIComponent(u)}&voice=${voice}`;
               // fetch sẽ tải hết file MP3, gọi .blob() ép trình duyệt đợi tải xong hoàn toàn
               const res = await fetch(audioUrl, { cache: "force-cache" });
               if (res.ok) {
                  const blob = await res.blob();
                  if (!isCancelled) {
                     setLoadedBytes(prev => prev + blob.size);
                     setLoadedAudios(prev => new Set(prev).add(u));
                  }
                  success = true;
               } else {
                  retries--;
                  if (retries > 0) await new Promise(r => setTimeout(r, 2000));
               }
            } catch (e) {
               console.warn(`Preload MP3 failed (retries left: ${retries - 1}):`, e);
               retries--;
               if (retries > 0) await new Promise(r => setTimeout(r, 2000));
            }
         }
      }
    };
  
    runPreload();
    return () => { isCancelled = true; };
  }, [truyenData?.nextUrl, preloadDepth, voice]);

  useEffect(() => {
     if (preloadUrls.length > 0 && loadedAudios.size === preloadUrls.length) {
        setPreloadStatus('done');
     }
  }, [loadedAudios.size, preloadUrls.length]);

  // Khởi tạo Lõi Phần Cứng: Audio Node
  const audioState = useAudioPlayer(truyenData?.title, url, truyenData?.nextUrl, voice, handleNextChapter);

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
    onBack: () => { setTruyenData(null); setUrl(""); },
    audioState,
    setThemeOpen,
    history,
    openBookshelf
  };

  return (
    <>
      {/* KHÔNG THỂ BỊ NGẮT MẠCH: Thẻ audio luôn chìm dưới đáy không phụ thuộc vào Theme */}
      <audio {...audioState.audioProps} />
      
      {/* KHÔNG DÙNG THẺ AUDIO ĐỂ PRELOAD NỮA VÌ NÓ BỊ LỖI RANGE. ĐÃ DÙNG FETCH() Ở TRÊN */}

      {/* GLOBAL UI OVERLAYS FOR PRELOAD */}
      {url && (
        <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2 items-end pointer-events-none">
          {preloadStatus !== 'idle' && (
            <div className="bg-black/50 backdrop-blur-md rounded-full px-3 py-1.5 flex items-center gap-2 border border-white/10 shadow-lg pointer-events-auto transition-all">
              {preloadStatus === 'loading' ? (
                 <span className="flex items-center gap-2 text-xs text-white/70 font-medium tracking-wider">
                   <svg className="animate-spin h-3 w-3 text-[#ff6600]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                   Tải sẵn {loadedAudios.size}/{preloadUrls.length} tập ({formatBytes(loadedBytes)})
                 </span>
              ) : (
                 <span className="flex items-center gap-1 text-xs text-[#39ff14] font-medium tracking-wider">
                   <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                   Đã tải {preloadUrls.length} tập ({formatBytes(loadedBytes)})
                 </span>
              )}
            </div>
          )}
          <button 
            onClick={() => {
              const next = preloadDepth === 1 ? 3 : 1;
              setPreloadDepth(next);
              localStorage.setItem("audio_preload_depth", next.toString());
            }}
            className="bg-black/50 backdrop-blur-md rounded-full px-3 py-1.5 text-[10px] text-white/50 hover:text-white border border-white/10 pointer-events-auto transition-colors tracking-widest uppercase font-bold shadow-lg"
          >
            Mức Preload: {preloadDepth}
          </button>
          <select 
            value={voice}
            onChange={(e) => {
              setVoice(e.target.value);
              localStorage.setItem("audio_truyen_voice", e.target.value);
            }}
            className="bg-black/50 backdrop-blur-md rounded-full px-3 py-1.5 text-[10px] text-white/50 hover:text-white border border-white/10 pointer-events-auto transition-colors tracking-widest font-bold shadow-lg appearance-none text-right outline-none cursor-pointer"
          >
            <option value="google">Giọng Google (Mặc định)</option>
            <option value="zalo_nam">Giọng Zalo Nam (Cần API Key)</option>
            <option value="zalo_nu">Giọng Zalo Nữ (Cần API Key)</option>
            <option value="viettel_nam">Viettel Nam (Cần API Key)</option>
            <option value="viettel_nu">Viettel Nữ (Cần API Key)</option>
          </select>
        </div>
      )}
      
      {/* NÚT TỦ SÁCH TOÀN CỤC KHI CHƯA VÀO TRUYỆN */}
      {!truyenData && (
         <button 
           onClick={openBookshelf}
           className="fixed top-4 left-4 z-[60] px-4 py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md shadow-lg text-white font-bold flex items-center gap-2 hover:bg-white/20 transition-all group"
         >
            <svg className="w-5 h-5 text-[#ff6600] group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
            Tủ Sách
         </button>
      )}

      {/* MÀN HÌNH TỦ SÁCH */}
      {bookshelfOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#111125] border border-white/20 p-6 w-full max-w-sm rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col max-h-[85vh]">
            <h3 className="text-white font-bold text-center mb-6 tracking-widest uppercase flex items-center justify-center gap-2">
              <svg className="w-6 h-6 text-[#ff6600]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
              Tủ Sách Của Khầy
            </h3>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.2) transparent' }}>
              {fullHistory.length === 0 ? (
                 <p className="text-center text-white/50 py-10 text-sm">Chưa có truyện nào trong tủ.</p>
              ) : (
                 fullHistory.map((item, idx) => {
                    const dt = new Date(item.time || Date.now());
                    const timeStr = `${dt.getDate()}/${dt.getMonth()+1} - ${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
                    return (
                      <button 
                        key={item.id || idx}
                        onClick={() => {
                          setBookshelfOpen(false);
                          setUrl(item.url);
                          fetchTruyen(item.url);
                        }}
                        className="w-full text-left p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#ff6600]/50 rounded-2xl transition-all group flex flex-col gap-2"
                      >
                         <span className="text-white font-bold text-sm line-clamp-2 group-hover:text-[#ff6600] transition-colors">{item.title}</span>
                         <div className="flex items-center justify-between mt-1">
                            <span className="text-[#39ff14] text-[10px] tracking-widest uppercase bg-[#39ff14]/10 px-2.5 py-1 rounded-full border border-[#39ff14]/20 font-bold flex items-center gap-1">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg> Phát Tiếp
                            </span>
                            <span className="text-white/30 text-[10px]">{timeStr}</span>
                         </div>
                      </button>
                    )
                 })
              )}
            </div>

            <button onClick={() => setBookshelfOpen(false)} className="mt-6 w-full text-center text-white/30 hover:text-white text-xs font-bold tracking-widest transition-colors py-3 border border-white/10 rounded-full bg-white/5 hover:bg-white/10 uppercase">
              Đóng Lại
            </button>
          </div>
        </div>
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
