import { Settings2, Loader2, Link as LinkIcon, Fingerprint, Play, Pause, SkipForward } from "lucide-react";
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

  const { isPlaying, isBuffering, currentTime, duration, togglePlay, handleSeek } = audioState;
  
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
            min-height: 100dvh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        .retro2-glass {
            backdrop-filter: blur(24px);
            background-color: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .retro2-mana-glow {
            box-shadow: 0 0 25px rgba(0, 240, 255, 0.6), inset 0 0 15px rgba(255, 255, 255, 0.5);
        }
        .vintage-corner {
            width: 40px;
            height: 40px;
            border: 1px solid rgba(0, 240, 255, 0.3);
            position: absolute;
        }
        .v-tl { top: 0; left: 0; border-right: 0; border-bottom: 0; border-top-width: 2px; border-left-width: 2px; }
        .v-tr { top: 0; right: 0; border-left: 0; border-bottom: 0; border-top-width: 2px; border-right-width: 2px; }
        .v-bl { bottom: 0; left: 0; border-right: 0; border-top: 0; border-bottom-width: 2px; border-left-width: 2px; }
        .v-br { bottom: 0; right: 0; border-left: 0; border-top: 0; border-bottom-width: 2px; border-right-width: 2px; }
      `}} />
      
      <div className="retro2-theme relative w-full h-[100dvh] font-sans selection:bg-[#00f0ff]/30">
        <div className="absolute inset-0 z-0 opacity-40 bg-[radial-gradient(circle_at_50%_-20%,#004e58_0%,#08080f_70%)] pointer-events-none"></div>

        <header className="relative z-50 flex justify-between items-center px-6 h-16 w-full border-b border-white/5 bg-transparent shrink-0">
          <div className="flex items-center">
             {truyenData ? (
                <button onClick={onBack} className="text-white/40 hover:text-[#00f0ff] transition-colors uppercase text-xs tracking-widest font-bold">
                  ◄ Return
                </button>
             ) : (
                <span className="text-[10px] uppercase font-bold tracking-[0.4em] text-[#00f0ff]/60">ARCHIVE</span>
             )}
          </div>
          <button onClick={() => setThemeOpen(true)} className="text-white/40 hover:text-[#00f0ff] transition-colors p-2">
             <Settings2 size={24} />
          </button>
        </header>

        <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 w-full max-w-md mx-auto">
          
          {/* INPUT MODE */}
          {!truyenData ? (
             <div className="w-full space-y-8 animate-in fade-in zoom-in-95 duration-500">
                <div className="text-center">
                   <h1 className="text-4xl font-serif font-bold text-white tracking-widest leading-none drop-shadow-lg mb-2">ARCHIVE</h1>
                   <div className="h-px w-16 mx-auto bg-[#00f0ff]/40 mb-6" />
                   <p className="text-[#00f0ff]/60 text-xs tracking-[0.2em] uppercase">Connect to source crystal</p>
                </div>

                <div className="relative">
                   <div className="absolute -inset-2 pointer-events-none opacity-50">
                      <div className="vintage-corner v-tl !w-6 !h-6"></div>
                      <div className="vintage-corner v-tr !w-6 !h-6"></div>
                      <div className="vintage-corner v-bl !w-6 !h-6"></div>
                      <div className="vintage-corner v-br !w-6 !h-6"></div>
                   </div>
                   <input
                      type="url"
                      className="w-full retro2-glass text-white px-6 py-5 outline-none placeholder:text-white/20 text-center font-mono text-sm shadow-[0_0_30px_rgba(0,0,0,0.5)]"
                      placeholder="https://..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                   />
                </div>

                {error && <div className="text-red-400 text-xs text-center p-3 retro2-glass border-red-500/20">{error}</div>}
                
                <button
                  onClick={() => fetchTruyen(url)}
                  disabled={loading || !url}
                  className="w-full py-4 retro2-glass border border-[#00f0ff]/30 text-[#00f0ff] uppercase tracking-[0.3em] font-bold text-sm hover:bg-[#00f0ff]/10 active:scale-95 disabled:opacity-30 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : "INITIALIZE"}
                </button>
             </div>
          ) : (
             /* AUDIO PLAYER MODE */
             <div className="w-full flex-1 flex flex-col pt-4 pb-8 animate-in fade-in">
                
                {/* Visual Art Box */}
                <div className="relative w-full aspect-[4/5] max-h-[45vh] group mb-auto">
                   <div className="absolute -inset-3 pointer-events-none">
                      <div className="vintage-corner v-tl"></div>
                      <div className="vintage-corner v-tr"></div>
                      <div className="vintage-corner v-bl"></div>
                      <div className="vintage-corner v-br"></div>
                   </div>
                   <div className="w-full h-full relative retro2-glass shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col justify-between">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 pointer-events-none" />
                      
                      <div className="p-4 flex justify-between items-start z-20">
                         <div className="retro2-glass px-3 py-1 flex items-center gap-2 rounded-full">
                            <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}></span>
                            <span className="text-[9px] font-bold tracking-widest text-white/80">{isBuffering ? "SYNCING..." : "CHANNEL: ALPHA"}</span>
                         </div>
                      </div>

                      <div className="p-6 relative z-20 text-center flex-1 flex flex-col items-center justify-center">
                         <div className="text-7xl font-serif text-white/90 drop-shadow-[0_0_20px_#00f0ff] select-none">
                           {formatTime(currentTime)}
                         </div>
                      </div>

                      <div className="p-6 z-20 relative">
                         <h2 className="text-3xl font-serif font-bold text-white tracking-tight leading-snug drop-shadow-lg line-clamp-2">{truyenData.title}</h2>
                         <div className="h-px w-12 bg-[#00f0ff]/40 mt-3" />
                      </div>
                   </div>
                </div>

                {/* Controls Area */}
                <div className="w-full mt-8">
                   <div className="w-full flex justify-between items-center mb-6 text-[10px] font-bold tracking-widest text-white/30 px-2">
                      <span>{formatTime(currentTime)}</span>
                      <div className="flex-grow mx-4 h-1 retro2-glass relative cursor-pointer group" onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                          handleSeek(percent * duration);
                        }}>
                         <div className="absolute left-0 top-0 h-full bg-[#00f0ff] shadow-[0_0_10px_#00f0ff] transition-all" style={{ width: `${progressPercent}%` }}></div>
                         {/* scrub grabber invisible layer */}
                         <input type="range" min="0" max={duration||100} value={currentTime} onChange={(e)=>handleSeek(parseFloat(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      </div>
                      <span>-{formatTime(remaining)}</span>
                   </div>

                   <div className="flex justify-center items-center gap-10">
                      <button onClick={() => truyenData.nextUrl && handleNextChapter(truyenData.nextUrl)} disabled={!truyenData.nextUrl} className="text-white/20 hover:text-[#00f0ff] disabled:opacity-20 active:scale-95 transition-all">
                         <SkipForward className="transform rotate-180" size={24} />
                      </button>

                      <button 
                         onClick={togglePlay}
                         disabled={isBuffering}
                         className="relative w-24 h-24 rounded-full bg-[#00f0ff]/10 flex items-center justify-center retro2-mana-glow border border-[#00f0ff]/40 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                      >
                         <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#00f0ff]/20 to-transparent blur-md"></div>
                         {isBuffering ? <Loader2 size={36} className="text-[#00f0ff] animate-spin relative z-10" /> : isPlaying ? <Pause size={36} fill="currentColor" className="text-[#00f0ff] relative z-10" /> : <Play size={36} fill="currentColor" className="text-[#00f0ff] ml-2 relative z-10" />}
                      </button>

                      <button onClick={() => truyenData.nextUrl && handleNextChapter(truyenData.nextUrl)} disabled={!truyenData.nextUrl} className="text-white/20 hover:text-[#00f0ff] disabled:opacity-20 active:scale-95 transition-all">
                         <SkipForward size={24} />
                      </button>
                   </div>
                </div>

             </div>
          )}
        </main>
      </div>
    </>
  );
}
