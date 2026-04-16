import { Settings2, Loader2, BookOpen, Fingerprint, Play, Pause, SkipForward } from "lucide-react";
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

export default function ThemeRetro1({
  url, setUrl, loading, error, truyenData, fetchTruyen, handleNextChapter, onBack, audioState, setThemeOpen
}: ThemeProps) {

  const { isPlaying, isBuffering, currentTime, duration, togglePlay, handleSeek } = audioState;
  
  // Calculate percentage for mana bar
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const remaining = duration - currentTime;

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        .retro1-theme {
            background-color: #111125 !important;
            color: #e2e0fc;
            font-family: 'Space Grotesk', sans-serif;
            min-height: 100dvh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        .retro1-corner {
            position: relative;
        }
        .retro1-corner::before, .retro1-corner::after {
            content: '';
            position: absolute;
            width: 8px;
            height: 8px;
            border: 2px solid #ffb778;
        }
        .retro1-tl::before { top: -4px; left: -4px; border-right: 0; border-bottom: 0; }
        .retro1-tr::after { top: -4px; right: -4px; border-left: 0; border-bottom: 0; }
        .retro1-bl::before { bottom: -4px; left: -4px; border-right: 0; border-top: 0; }
        .retro1-br::after { bottom: -4px; right: -4px; border-left: 0; border-top: 0; }
        .mana-bar-gradient {
            background: linear-gradient(90deg, #00daf3 0%, #c7bfff 100%);
        }
      `}} />
      
      <div className="retro1-theme relative w-full h-[100dvh]">
        {/* TopAppBar */}
        <header className="flex justify-between items-center px-4 h-16 w-full bg-[#111125] border-b-2 border-[#564334]/20 z-50 shrink-0">
          <div className="flex items-center gap-3">
             {truyenData && (
                <button onClick={onBack} className="text-[#FF8C00] active:scale-95 duration-100 p-2 hover:bg-[#333348] transition-colors rounded-none">
                  ◄ BACK
                </button>
             )}
             {!truyenData && (
                <h1 className="font-['Space_Grotesk'] uppercase text-xl font-bold text-[#FF8C00] tracking-widest">
                  AUDIO LOG
                </h1>
             )}
          </div>
          <button onClick={() => setThemeOpen(true)} className="text-[#FF8C00] active:scale-95 duration-100 p-2 hover:bg-[#333348] transition-colors">
             <Settings2 size={24} />
          </button>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-lg mx-auto relative overflow-hidden">
          
          {/* INPUT MODE */}
          {!truyenData ? (
             <div className="w-full space-y-6">
                <div className="text-center space-y-2 mb-10">
                   <div className="w-24 h-24 mx-auto border-4 border-[#ffb778] p-2 retro1-corner retro1-tl retro1-br">
                      <div className="w-full h-full bg-[#333348] flex items-center justify-center">
                         <BookOpen size={40} className="text-[#ffb778]" />
                      </div>
                   </div>
                   <h2 className="text-2xl font-bold uppercase tracking-widest text-[#e2e0fc] mt-6">QUEST TARGET</h2>
                   <p className="text-[#00daf3] text-xs font-bold uppercase tracking-widest">Paste Data Link</p>
                </div>
                
                <div className="relative border-2 border-[#564334] p-1 bg-[#1a1a2e]">
                   <input
                      type="url"
                      className="w-full bg-[#111125] text-white p-4 font-mono text-sm outline-none placeholder:text-[#564334]"
                      placeholder="https://..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                   />
                   <Fingerprint size={20} className={`absolute right-4 top-1/2 -translate-y-1/2 ${url ? 'text-[#00daf3]' : 'text-[#564334]'}`} />
                </div>
                {error && <div className="text-red-400 text-xs text-center border border-red-500/50 p-2 font-mono bg-red-500/10 uppercase tracking-widest">{error}</div>}
                
                <button
                  onClick={() => fetchTruyen(url)}
                  disabled={loading || !url}
                  className="w-full bg-[#ffb778] text-[#111125] py-4 font-bold text-lg uppercase tracking-widest active:scale-95 transition-transform disabled:opacity-50 flex justify-center items-center gap-3 border-[3px] border-[#fb8f00]"
                >
                   {loading ? <><Loader2 className="animate-spin" size={20} /> SYNCING...</> : "EXECUTE"}
                </button>
             </div>
          ) : (
             /* AUDIO PLAYER MODE */
             <div className="w-full flex-1 flex flex-col justify-center animate-in fade-in">
                {/* Quest Info */}
                <div className="w-full mb-6 space-y-2 text-center">
                   <div className="flex justify-center items-center gap-2 text-[#00bbd0] text-xs font-bold uppercase tracking-[0.2em] mb-4">
                      {isBuffering ? (
                         <><Loader2 className="animate-spin" size={14} /> BUILDING DATA</>
                      ) : (
                         <>▶ LIVE AUDIO</>
                      )}
                   </div>
                   <h2 className="text-2xl font-extrabold text-[#e2e0fc] uppercase leading-tight tracking-tight line-clamp-3">
                      {truyenData.title}
                   </h2>
                </div>

                {/* Stylized Cover Art Section */}
                <div className="relative w-full aspect-square max-h-[300px] mb-8 group mx-auto border-2 border-[#564334]/50 p-2">
                   <div className="w-full h-full bg-[#1a1a2e] relative overflow-hidden flex items-center justify-center retro1-corner retro1-tl retro1-tr retro1-bl retro1-br">
                      <div className="absolute inset-0 bg-[#00daf3]/5 animate-pulse" />
                      <div className="text-7xl font-mono text-[#00daf3]/90 drop-shadow-[0_0_15px_#00daf3]">
                         {formatTime(currentTime)}
                      </div>
                      <div className="absolute bottom-4 left-4 bg-[#ffb778] text-[#111125] px-2 py-0.5 text-[10px] font-bold tracking-widest">SLOT 01</div>
                   </div>
                </div>

                {/* Mana Bar */}
                <div className="w-full space-y-3 mb-10">
                   <div className="flex justify-between items-end text-[11px] font-bold tracking-widest text-[#a48c7a]">
                      <div className="space-y-1">
                         <div className="text-[9px] text-[#00daf3]/80 uppercase">ELAPSED</div>
                         <div>{formatTime(currentTime)}</div>
                      </div>
                      <div className="space-y-1 text-right">
                         <div className="text-[9px] text-[#00daf3]/80 uppercase">REMAINING</div>
                         <div>-{formatTime(remaining)}</div>
                      </div>
                   </div>

                   <div className="relative h-5 bg-[#333348] w-full cursor-pointer flex items-center p-0.5 border border-[#564334]">
                      <input 
                         type="range"
                         min="0"
                         max={duration || 100}
                         value={currentTime}
                         onChange={(e) => handleSeek(parseFloat(e.target.value))}
                         className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                      />
                      <div className="mana-bar-gradient h-full relative z-10 transition-all duration-300 pointer-events-none" style={{ width: `${progressPercent}%` }}>
                         <div className="absolute right-0 top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_#fff]"></div>
                      </div>
                      <div className="absolute top-0 left-1/2 w-px h-full bg-[#564334]/30 pointer-events-none"></div>
                   </div>
                </div>

                {/* Audio Controls */}
                <div className="flex items-center justify-center gap-8 w-full mb-8">
                   <button 
                      onClick={() => handleSeek(Math.max(0, currentTime - 10))}
                      className="text-[#ffb778]/70 hover:text-[#ffb778] active:scale-90 font-mono text-xs tracking-widest"
                   >
                      -10s
                   </button>
                   
                   <button 
                      onClick={togglePlay}
                      disabled={isBuffering}
                      className="w-20 h-20 bg-[#ffb778] text-[#111125] flex flex-col items-center justify-center shadow-[0_0_30px_rgba(255,183,120,0.3)] hover:shadow-[0_0_40px_rgba(0,218,243,0.5)] active:scale-95 transition-all disabled:opacity-50"
                   >
                      {isBuffering ? <Loader2 size={36} className="animate-spin" /> : isPlaying ? <Pause size={36} fill="currentColor" /> : <Play size={36} fill="currentColor" />}
                   </button>

                   <button 
                      onClick={() => handleSeek(Math.min(duration, currentTime + 10))}
                      className="text-[#ffb778]/70 hover:text-[#ffb778] active:scale-90 font-mono text-xs tracking-widest"
                   >
                      +10s
                   </button>
                </div>

                {/* Next Chapter */}
                {truyenData.nextUrl && (
                   <button 
                      onClick={() => handleNextChapter(truyenData.nextUrl)}
                      className="w-full bg-[#1a1a2e] hover:bg-[#333348] border-2 border-[#ffb778]/50 p-4 flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
                   >
                      <div className="text-[10px] font-bold text-[#00bbd0] tracking-[0.3em] uppercase">PROCEED TO NEXT MODULE</div>
                      <SkipForward size={16} className="text-[#ffb778]" />
                   </button>
                )}
             </div>
          )}
        </main>
      </div>
    </>
  );
}
