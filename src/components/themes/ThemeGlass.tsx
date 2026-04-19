import { Headphones, Loader2, Link as LinkIcon, BookOpen, Fingerprint, Play, Pause, SkipForward, SkipBack, ArrowLeft, Gauge, Activity, Settings2, RotateCcw, RotateCw, RefreshCw } from "lucide-react";
import { formatTime } from "@/utils/formatTime";

interface ThemeProps {
  url: string;
  setUrl: (v: string) => void;
  loading: boolean;
  error: string;
  truyenData: any;
  fetchTruyen: (url: string) => void;
  handleNextChapter: (url: string) => void;
  handlePrevChapter: (url: string) => void;
  handleRefresh: () => void;
  onBack: () => void;
  audioState: any;
  setThemeOpen: (b: boolean) => void;
  history?: { title: string, url: string } | null;
}

export default function ThemeGlass({
  url, setUrl, loading, error, truyenData, fetchTruyen, handleNextChapter, handlePrevChapter, handleRefresh, onBack, audioState, setThemeOpen, history
}: ThemeProps) {

  const { isPlaying, isBuffering, speed, currentTime, duration, togglePlay, toggleSpeed, handleSeek } = audioState;

  return (
    <div className="relative h-full w-full bg-slate-950 text-gray-100 flex flex-col overflow-y-auto overflow-x-hidden font-sans">
      {/* Background Orbs local to Glass theme */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-indigo-600/30 rounded-full mix-blend-screen filter blur-[100px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#ff6600]/20 rounded-full mix-blend-screen filter blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03)_0%,transparent_100%)] pointer-events-none" />
      
      <div className="h-full w-full bg-white/5 backdrop-blur-3xl flex flex-col justify-between relative z-10">

        {/* Nút Đổi Menu Theme */}
        <button onClick={() => setThemeOpen(true)} className="absolute top-4 right-4 z-50 p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/20 transition-all backdrop-blur-md group">
          <Settings2 size={24} className="text-white/70 group-hover:text-white" />
        </button>

        {/* INPUT MODE */}
        {!truyenData ? (
          <div className="flex-1 flex flex-col justify-center px-6 py-10">
            <div className="flex flex-col items-center mb-10">
              <div className="w-20 h-20 bg-gradient-to-br from-[#ff6600] to-pink-600 rounded-3xl flex items-center justify-center shadow-lg shadow-[#ff6600]/30 mb-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/20 backdrop-blur-md" />
                <Headphones size={36} className="text-white relative z-10" />
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Đọc truyện chữ</h1>
              <p className="text-gray-400 text-sm text-center font-medium px-4">AI Nghe truyện auto đỉnh quá (TruyenFull, Metruyenchu...)</p>
            </div>
            
            <div className="space-y-6 w-full max-w-sm mx-auto">
              <div className="space-y-3 relative z-20">
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
                <div className="p-4 bg-red-500/10 border border-red-500/20 backdrop-blur-md rounded-2xl text-red-400 text-sm font-medium text-center shadow-inner relative z-20">
                  {error}
                </div>
              )}

              <button
                onClick={() => fetchTruyen(url)}
                disabled={loading || !url}
                className="w-full py-4 mt-4 bg-white/10 hover:bg-white/20 border border-white/20 disabled:opacity-50 text-white rounded-2xl font-bold transition-all flex justify-center items-center gap-2 backdrop-blur-md relative overflow-hidden group z-20"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ff6600]/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                {loading ? (
                  <><Loader2 className="animate-spin relative z-10" size={20} /> <span className="relative z-10">Đang vét máng dữ liệu...</span></>
                ) : (
                  <><BookOpen size={20} className="relative z-10" /> <span className="relative z-10 text-[#ff6600]">Nghe Audio Chứ Lì</span></>
                )}
              </button>

              {history && (
                 <div className="pt-4 border-t border-white/10 w-full relative z-20 animate-in fade-in slide-in-from-bottom-2">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center mb-3">Hoặc tiếp tục nghe</p>
                    <button 
                      onClick={() => { setUrl(history.url); fetchTruyen(history.url); }}
                      className="w-full text-left p-4 bg-white/5 hover:bg-white/10 border border-[#ff6600]/30 rounded-2xl transition-all shadow-lg group relative overflow-hidden flex flex-col gap-1"
                    >
                       <span className="text-[#ff6600] font-bold text-xs uppercase tracking-wider group-hover:text-[#ff8833] transition-colors line-clamp-1">{history.title}</span>
                       <span className="text-gray-400 text-[10px] line-clamp-1">{history.url}</span>
                    </button>
                 </div>
              )}
            </div>
          </div>
        ) : (
          /* AUDIO PLAYER MODE */
          <div className="flex-1 flex flex-col justify-between p-6 animate-in fade-in duration-500 pt-6">
             {/* Top Bar */}
            <div className="flex justify-between items-center relative z-20">
              <button 
                onClick={onBack} 
                className="w-12 h-12 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-white transition-all shadow-lg shrink-0"
              >
                <ArrowLeft size={22} className="opacity-80" />
              </button>
              
              <div className="px-5 py-2.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full flex items-center gap-2 shadow-lg mx-2.5 min-w-0">
                 {isBuffering ? (
                    <Loader2 size={16} className="text-[#ff6600] animate-spin shrink-0" />
                 ) : (
                    <Activity size={16} className={isPlaying ? "text-[#ff6600] animate-pulse" : "text-white/40"} />
                 )}
                 <span className="text-[10px] sm:text-xs font-semibold tracking-wider text-white/80 uppercase truncate">
                   {isBuffering ? "Building MP3..." : "Now Reading"}
                 </span>
              </div>

              <div className="w-12 h-12 shrink-0"></div>
            </div>

            {/* Album Artwork */}
            <div className="flex-1 flex flex-col items-center justify-center py-6 relative z-10 w-full min-h-0">
              <div className="w-[200px] h-[200px] shrink-0 bg-white/5 backdrop-blur-2xl border border-white/20 rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(255,102,0,0.3)] flex flex-col items-center justify-center p-6 relative overflow-hidden group mb-6">
                   <div className={`absolute inset-0 bg-gradient-to-br from-indigo-500/30 via-transparent to-[#ff6600]/30 transition-opacity duration-700 ${isPlaying ? "opacity-100" : "opacity-30"}`} />
                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.2),transparent_50%)]" />
                   
                   {isBuffering ? (
                     <Loader2 size={60} className="text-white/50 animate-spin relative z-10" />
                   ) : (
                     <div className="text-5xl sm:text-6xl font-black text-white/90 drop-shadow-lg relative z-10 font-sans tracking-tighter">
                        {formatTime(currentTime)}
                     </div>
                   )}
                   
                   <div className="absolute bottom-4 text-[9px] uppercase tracking-[0.2em] text-white/50 font-bold mix-blend-overlay">Mạch Nền Hoạt Động</div>
              </div>

              <div className="text-center w-full px-2 min-h-0 overflow-y-auto">
                <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug drop-shadow-md pb-2">{truyenData.title}</h2>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <p className="text-white/40 text-[10px] sm:text-sm font-medium uppercase tracking-widest">{formatTime(duration)} Tổng thời lượng</p>
                  <button onClick={handleRefresh} className="p-1 hover:bg-white/10 rounded-full text-white/50 hover:text-[#ff6600] transition-colors" title="Load lại audio">
                    <RefreshCw size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Controls & Progress */}
            <div className="w-full relative z-20 pb-2">
              <div className="space-y-3 px-2 mb-6">
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

              <div className="flex flex-col gap-4">
                 <div className="flex items-center justify-center gap-4 sm:gap-6">
                   <button 
                     onClick={toggleSpeed} 
                     className="w-12 h-12 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 rounded-full flex flex-col items-center justify-center text-[#ff6600] transition-all shadow-lg shrink-0"
                   >
                     <Gauge size={16} className="mb-0.5 opacity-80" />
                     <span className="text-[9px] font-black leading-none">{speed}x</span>
                   </button>
   
                   <button 
                     onClick={() => handleSeek(Math.max(0, currentTime - 10))}
                     className="w-12 h-12 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-white transition-all shadow-lg shrink-0"
                   >
                     <RotateCcw size={18} className="opacity-80" />
                   </button>
   
                   <button 
                     onClick={togglePlay}
                     disabled={isBuffering}
                     className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#ff6600] to-rose-600 shadow-[0_10px_30px_-10px_rgba(255,102,0,0.8)] border border-white/30 text-white rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 relative overflow-hidden shrink-0"
                   >
                     <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.4),transparent_60%)]" />
                     {isBuffering ? (
                       <Loader2 size={24} className="relative z-10 animate-spin" />
                     ) : isPlaying ? (
                       <Pause size={28} fill="currentColor" className="relative z-10" />
                     ) : (
                       <Play size={28} fill="currentColor" className="ml-1.5 relative z-10" />
                     )}
                   </button>
   
                   <button 
                     onClick={() => handleSeek(Math.min(duration, currentTime + 10))}
                     className="w-12 h-12 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-white transition-all shadow-lg shrink-0"
                   >
                     <RotateCw size={18} className="opacity-80" />
                   </button>
                 </div>

                 <div className="flex justify-between items-center gap-4 w-full mt-2">
                    <button
                       onClick={() => truyenData.prevUrl && handlePrevChapter(truyenData.prevUrl)}
                       disabled={!truyenData.prevUrl}
                       className="flex-1 py-3 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 text-white rounded-2xl flex items-center justify-center transition-all shadow-lg disabled:opacity-30 gap-2 font-semibold text-sm"
                    >
                       <SkipBack size={18} /> Lùi Chương
                    </button>
                    <button
                       onClick={() => truyenData.nextUrl && handleNextChapter(truyenData.nextUrl)}
                       disabled={!truyenData.nextUrl}
                       className="flex-1 py-3 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 text-[#ff6600] rounded-2xl flex items-center justify-center transition-all shadow-lg disabled:opacity-30 gap-2 font-bold text-sm"
                    >
                       Chuyển Chương <SkipForward size={18} />
                    </button>
                 </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
