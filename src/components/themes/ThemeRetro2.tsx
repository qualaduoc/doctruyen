import { Settings2, Loader2, Fingerprint, Play, Pause, SkipForward, ArrowLeft, RotateCcw, RotateCw, Gauge } from "lucide-react";
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

export default function ThemeRetro2({
  url, setUrl, loading, error, truyenData, fetchTruyen, handleNextChapter, onBack, audioState, setThemeOpen
}: ThemeProps) {

  const { isPlaying, isBuffering, currentTime, duration, speed, togglePlay, toggleSpeed, handleSeek } = audioState;
  
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const remaining = duration - currentTime;

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&family=Cinzel:wght@400;700&display=swap');
        .retro2-theme {
            background-color: #08080f !important;
            color: #e2e0fc;
            font-family: 'Space Grotesk', 'Cinzel', sans-serif;
            height: 100%;
            display: flex;
            flex-direction: column;
            overflow-x: hidden;
            overflow-y: auto;
        }
        .retro2-glass {
            background: rgba(20, 20, 35, 0.4);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(0, 240, 255, 0.1);
        }
      `}} />
      
      <div className="retro2-theme w-full relative">
        <header className="flex justify-between items-center px-4 pt-6 shrink-0 relative z-50">
          <div className="flex items-center gap-3">
             {truyenData && (
                <button onClick={onBack} className="text-[#00f0ff] active:scale-95 duration-100 p-2 hover:bg-[#00f0ff]/10 transition-colors uppercase tracking-widest text-xs font-bold">
                  ◄ Retour
                </button>
             )}
          </div>
          <button onClick={() => setThemeOpen(true)} className="text-[#00f0ff] active:scale-95 duration-100 p-2 hover:bg-[#00f0ff]/10 transition-colors">
             <Settings2 size={24} />
          </button>
        </header>

        <main className="flex-1 flex flex-col items-center px-6 py-6 w-full max-w-lg mx-auto relative z-10">
          
          {/* INPUT MODE */}
          {!truyenData ? (
             <div className="w-full space-y-6">
                <div className="text-center space-y-2 mb-10 w-full relative">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-[#00f0ff]/10 rounded-full mix-blend-screen filter blur-[40px]" />
                   <h2 className="text-3xl font-bold uppercase tracking-widest text-white mt-10 z-10 relative font-['Cinzel']">CỬA ẢI BÍ CẢNH</h2>
                   <p className="text-[#00f0ff] text-xs font-bold uppercase tracking-widest z-10 relative">Enter your token</p>
                </div>
                
                <div className="relative border border-[#00f0ff]/30 p-2 bg-[#0a0a14]">
                   <input
                      type="url"
                      className="w-full bg-[#05050a] text-white p-4 font-['Space_Grotesk'] text-sm outline-none placeholder:text-[#00f0ff]/30 shadow-inner"
                      placeholder="https://..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                   />
                </div>
                {error && <div className="text-red-400 text-xs text-center border border-red-900/50 p-2 font-mono bg-red-900/20 uppercase tracking-widest">{error}</div>}
                
                <button
                  onClick={() => fetchTruyen(url)}
                  disabled={loading || !url}
                  className="w-full bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 text-[#00f0ff] py-5 font-bold text-lg uppercase tracking-[0.2em] active:scale-95 transition-all disabled:opacity-50 flex justify-center items-center gap-3 border border-[#00f0ff]/40 shadow-[0_0_20px_rgba(0,240,255,0.1)] hover:shadow-[0_0_30px_rgba(0,240,255,0.3)]"
                >
                   {loading ? <><Loader2 className="animate-spin" size={20} /> SYNCHRONIZING</> : "TIẾP CẬN BÍ CẢNH"}
                </button>
             </div>
          ) : (
             /* AUDIO PLAYER MODE */
             <div className="w-full flex-1 flex flex-col justify-center animate-in fade-in pt-4">
                <div className="w-full max-w-sm mx-auto flex-1 flex flex-col pb-4">
                   
                   <div className="relative w-full aspect-[4/5] rounded-[2rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-[#00f0ff]/10 group shrink-0 max-h-[35vh]">
                      <div className="absolute inset-0 bg-[#0a0a15]">
                         <div className="absolute inset-0 bg-gradient-to-t from-[#08080f] via-transparent to-transparent opacity-80 z-10" />
                      </div>
                      
                      <div className="absolute inset-0 flex flex-col opacity-90 transition-opacity z-20">
                      
                      <div className="p-4 flex justify-between items-start z-20">
                         <div className="retro2-glass px-3 py-1 flex items-center gap-2 rounded-full">
                            <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}></span>
                            <span className="text-[9px] font-bold tracking-widest text-white/80">{isBuffering ? "SYNCING..." : "CHANNEL: ALPHA"}</span>
                         </div>
                      </div>

                      <div className="p-6 relative z-20 text-center flex-1 flex flex-col justify-center items-center">
                         <div className="text-6xl font-['Cinzel'] text-white/90 drop-shadow-[0_0_30px_#00f0ff] select-none tracking-tighter">
                           {formatTime(currentTime)}
                         </div>
                      </div>

                      <div className="p-6 z-20 relative">
                         <h2 className="text-xl sm:text-2xl font-['Cinzel'] font-bold text-white tracking-widest line-clamp-2">{truyenData.title}</h2>
                         <div className="h-px w-12 bg-[#00f0ff]/40 mt-3" />
                      </div>
                   </div>
                </div>

                {/* Controls Area */}
                <div className="w-full mt-8 shrink-0">
                   <div className="w-full flex justify-between items-center mb-6 text-[10px] sm:text-xs font-bold tracking-[0.2em] text-[#00f0ff] uppercase">
                      <span>{formatTime(currentTime)}</span>
                      <div className="flex-grow mx-4 h-1 retro2-glass relative cursor-pointer group" onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                          handleSeek(percent * duration);
                        }}>
                         <div className="absolute left-0 top-0 h-full bg-[#00f0ff] shadow-[0_0_10px_#00f0ff] transition-all" style={{ width: `${progressPercent}%` }}></div>
                         <input type="range" min="0" max={duration||100} value={currentTime} onChange={(e)=>handleSeek(parseFloat(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      </div>
                      <span>-{formatTime(remaining)}</span>
                   </div>

                   <div className="flex justify-between items-center gap-2 sm:gap-6 w-full">
                      <button onClick={toggleSpeed} className="w-12 h-12 flex flex-col items-center justify-center text-white/70 hover:text-white active:scale-95 transition-all outline-none">
                         <Gauge size={18} className="mb-0.5" />
                         <span className="text-[9px] font-black">{speed}x</span>
                      </button>

                      <button onClick={() => handleSeek(Math.max(0, currentTime - 10))} className="w-12 h-12 flex items-center justify-center text-white/70 hover:text-white active:scale-95 transition-all outline-none">
                         <RotateCcw size={22} />
                      </button>

                      <button 
                         onClick={togglePlay}
                         disabled={isBuffering}
                         className="relative w-20 h-20 rounded-full bg-[#00f0ff]/10 flex items-center justify-center text-white active:scale-95 transition-all disabled:opacity-50 group shadow-[0_0_30px_rgba(0,240,255,0.15)] hover:shadow-[0_0_40px_rgba(0,240,255,0.3)] shrink-0"
                      >
                         <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#00f0ff]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                         {isBuffering ? <Loader2 size={32} className="text-[#00f0ff] animate-spin" /> : isPlaying ? <Pause size={32} fill="currentColor" className="text-[#00f0ff]" /> : <Play size={32} fill="currentColor" className="ml-2 text-[#00f0ff]" />}
                      </button>

                      <button onClick={() => handleSeek(Math.min(duration, currentTime + 10))} className="w-12 h-12 flex items-center justify-center text-white/70 hover:text-white active:scale-95 transition-all outline-none">
                         <RotateCw size={22} />
                      </button>

                      <button onClick={() => truyenData.nextUrl && handleNextChapter(truyenData.nextUrl)} className="w-12 h-12 flex items-center justify-center text-white/70 hover:text-white active:scale-95 transition-all outline-none">
                         <SkipForward size={22} />
                      </button>
                   </div>
                   
                   {truyenData.nextUrl && (
                      <button 
                         onClick={() => handleNextChapter(truyenData.nextUrl)}
                         className="w-full mt-8 py-4 retro2-glass border border-[#00f0ff]/20 text-[#00f0ff]/80 hover:text-[#00f0ff] font-['Cinzel'] tracking-widest text-xs uppercase flex justify-center items-center gap-3 active:scale-[0.98] transition-all rounded-xl"
                      >
                         CHUYỂN QUA CHƯƠNG KẾ <SkipForward size={16} />
                      </button>
                   )}
                </div>

             </div>
          </div>
          )}
        </main>
      </div>
    </>
  );
}
