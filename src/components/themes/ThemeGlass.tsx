import { Headphones, Loader2, Link as LinkIcon, BookOpen, Fingerprint, Play, Pause, SkipForward, ArrowLeft, Gauge, Activity, Settings2 } from "lucide-react";
import { formatTime } from "@/utils/formatTime";

interface ThemeProps {
  url: string;
  setUrl: (v: string) => void;
  loading: boolean;
  error: string;
  truyenData: any;
  fetchTruyen: (url: string) => void;
  handleNextChapter: (url: string) => void;
  onBack: () => void;
  audioState: any;
  setThemeOpen: (b: boolean) => void;
}

export default function ThemeGlass({
  url, setUrl, loading, error, truyenData, fetchTruyen, handleNextChapter, onBack, audioState, setThemeOpen
}: ThemeProps) {

  const { isPlaying, isBuffering, speed, currentTime, duration, togglePlay, toggleSpeed, handleSeek } = audioState;

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center p-4 bg-slate-950 text-gray-100 relative overflow-hidden font-sans">
      {/* Nút Đổi Menu Theme */}
      <button onClick={() => setThemeOpen(true)} className="absolute top-6 right-6 z-50 p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/20 transition-all backdrop-blur-md group">
        <Settings2 size={24} className="text-white/70 group-hover:text-white" />
      </button>

      {/* Cầu Quang Phổ */}
      <div className="absolute top-1/4 left-[10%] w-80 h-80 bg-indigo-600/30 rounded-full mix-blend-screen filter blur-[100px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-[10%] w-96 h-96 bg-[#ff6600]/20 rounded-full mix-blend-screen filter blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/[0.03] to-transparent pointer-events-none" />

      <div className="w-full max-w-[400px] bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] relative z-10 flex flex-col justify-between" style={{ minHeight: "750px" }}>

        {/* INPUT MODE */}
        {!truyenData ? (
          <>
            <div className="p-8 pb-4 flex flex-col items-center mt-8">
              <div className="w-20 h-20 bg-gradient-to-br from-[#ff6600] to-pink-600 rounded-3xl flex items-center justify-center shadow-lg shadow-[#ff6600]/30 mb-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/20 backdrop-blur-md" />
                <Headphones size={36} className="text-white relative z-10" />
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Nghe truyện chữ</h1>
              <p className="text-gray-400 text-sm text-center font-medium px-4">Đọc auto mọi loại truyện (Wattpad, TruyenFull, Metruyenchu...)</p>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-center">
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
                    <><Loader2 className="animate-spin relative z-10" size={20} /> <span className="relative z-10">Đang vét máng dữ liệu...</span></>
                  ) : (
                    <><BookOpen size={20} className="relative z-10" /> <span className="relative z-10 text-[#ff6600]">Nghe Audio Chứ Lì</span></>
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          /* AUDIO PLAYER MODE */
          <div className="p-6 flex-1 flex flex-col justify-center animate-in fade-in duration-500">
             {/* Top Bar */}
            <div className="flex justify-between items-center mb-8 relative z-20">
              <button 
                onClick={onBack} 
                className="w-12 h-12 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-white transition-all shadow-lg"
              >
                <ArrowLeft size={22} className="opacity-80" />
              </button>
              
              <div className="px-5 py-2.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full flex items-center gap-2 shadow-lg">
                 {isBuffering ? (
                    <Loader2 size={16} className="text-[#ff6600] animate-spin" />
                 ) : (
                    <Activity size={16} className={isPlaying ? "text-[#ff6600] animate-pulse" : "text-white/40"} />
                 )}
                 <span className="text-xs font-semibold tracking-wider text-white/80 uppercase">
                   {isBuffering ? "Building MP3..." : "Now Reading"}
                 </span>
              </div>

              <button 
                onClick={toggleSpeed} 
                className="w-12 h-12 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 rounded-full flex flex-col items-center justify-center text-[#ff6600] transition-all shadow-lg"
              >
                <Gauge size={16} className="mb-0.5 opacity-80" />
                <span className="text-[10px] font-black">{speed}x</span>
              </button>
            </div>

            {/* Album Artwork */}
            <div className="flex-1 flex flex-col items-center justify-center space-y-10 relative z-10 w-full mb-8">
              <div className="w-[200px] h-[200px] bg-white/5 backdrop-blur-2xl border border-white/20 rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(255,102,0,0.3)] flex flex-col items-center justify-center p-6 relative overflow-hidden group">
                   <div className={`absolute inset-0 bg-gradient-to-br from-indigo-500/30 via-transparent to-[#ff6600]/30 transition-opacity duration-700 ${isPlaying ? "opacity-100" : "opacity-30"}`} />
                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.2),transparent_50%)]" />
                   
                   {isBuffering ? (
                     <Loader2 size={60} className="text-white/50 animate-spin relative z-10" />
                   ) : (
                     <div className="text-6xl font-black text-white/90 drop-shadow-lg relative z-10 font-sans tracking-tighter">
                        {formatTime(currentTime)}
                     </div>
                   )}
                   
                   <div className="absolute bottom-4 text-[10px] uppercase tracking-[0.2em] text-white/50 font-bold mix-blend-overlay">Mạch Nền Hoạt Động</div>
              </div>

              <div className="text-center w-full px-2">
                <h2 className="text-2xl font-bold text-white line-clamp-3 leading-snug drop-shadow-md">{truyenData.title}</h2>
                <p className="text-white/40 text-sm mt-3 font-medium uppercase tracking-widest">{formatTime(duration)} Tổng thời lượng</p>
              </div>
            </div>

            {/* Controls & Progress */}
            <div className="w-full relative z-20 space-y-8">
              <div className="space-y-3 px-2">
                 <input 
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={(e) => handleSeek(parseFloat(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none outline-none bg-white/10 cursor-pointer accent-[#ff6600] shadow-[0_0_15px_rgba(255,102,0,0.4)]" 
                />
                <div className="flex justify-between text-[11px] text-white/40 font-bold tracking-wider">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-6">
                <div className="w-14 h-14" />
                <button 
                  onClick={togglePlay}
                  disabled={isBuffering}
                  className="w-20 h-20 bg-gradient-to-br from-[#ff6600] to-rose-600 shadow-[0_10px_30px_-10px_rgba(255,102,0,0.8)] border border-white/30 text-white rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.4),transparent_60%)]" />
                  {isBuffering ? (
                    <Loader2 size={30} className="relative z-10 animate-spin" />
                  ) : isPlaying ? (
                    <Pause size={30} fill="currentColor" className="relative z-10" />
                  ) : (
                    <Play size={30} fill="currentColor" className="ml-2 relative z-10" />
                  )}
                </button>
                <button 
                  onClick={() => truyenData.nextUrl && handleNextChapter(truyenData.nextUrl)}
                  className="w-14 h-14 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 text-white rounded-full flex items-center justify-center transition-all shadow-lg"
                >
                  <SkipForward fill="currentColor" size={20} className="opacity-80" />
                </button>
              </div>

              {truyenData.nextUrl ? (
                <button 
                  onClick={() => handleNextChapter(truyenData.nextUrl)}
                  className="w-full mt-6 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 text-white/90 rounded-2xl font-bold transition-all flex justify-center items-center gap-3 shadow-lg group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                  Chuyển qua Chương kế <SkipForward size={18} className="text-[#ff6600]" />
                </button>
              ) : (
                <div className="text-center text-xs text-white/30 bg-white/5 backdrop-blur-md border border-white/5 p-4 rounded-2xl mt-6 uppercase tracking-wider font-semibold">
                  Đã sát vách (Không tìm thấy link tiếp)
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
