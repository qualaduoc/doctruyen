import { Settings2, Loader2, Link as LinkIcon, Fingerprint, Play, Pause, SkipForward, SkipBack, ArrowLeft, RotateCcw, RotateCw, Gauge, RefreshCw } from "lucide-react";
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

export default function ThemeRetro3({
  url, setUrl, loading, error, truyenData, fetchTruyen, handleNextChapter, handlePrevChapter, handleRefresh, onBack, audioState, setThemeOpen, history
}: ThemeProps) {

  const { isPlaying, isBuffering, currentTime, duration, speed, togglePlay, toggleSpeed, handleSeek } = audioState;
  
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const remaining = duration - currentTime;

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Philosopher:wght@400;700&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Space+Grotesk:wght@300;400;700&display=swap');
        .retro3-theme {
            background-color: #050a1a !important;
            background-image: radial-gradient(circle at center, #111b36 0%, #0a1128 100%);
            color: #f0ead6;
            font-family: 'Cormorant Garamond', serif;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            position: relative;
        }
        .leather-texture {
            background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuCb33VP2GKXuSmQsq-9uXwzw5dw_307EUtv9TdII0dSgZqNOYTpeWiOguZQmHfF2t5F4aUyKh7UeN5yfRkWbJs5BNrOlhU8USPCH2URTaepms0R9jHbTGhaTByAc4HUyE4Q-H-YWKmjVoP_IReg-0Km9fgXKKak1-3ZdgmikkZLScfXlX0j9-v19FZPHGPazyjdgZFi5W-4l-hqDNcxxE1ZBymeDxwABggSU22MqY6HKOav-BSvwR98X5tbOhUFsgbVbCSOzI8KAiY');
            opacity: 0.15;
            pointer-events: none;
        }
        .gold-filigree {
            border: 2px solid #d4af37;
            box-shadow: inset 0 0 10px rgba(212, 175, 55, 0.3), 0 0 15px rgba(212, 175, 55, 0.2);
            position: relative;
        }
        .gold-filigree::before {
            content: "";
            position: absolute;
            inset: -8px;
            border: 1px solid #d4af37;
            opacity: 0.5;
            pointer-events: none;
        }
        .rune-button {
            background: radial-gradient(circle, #d4af37 0%, #8a7431 100%);
            clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
            filter: drop-shadow(0 0 15px rgba(212, 175, 55, 0.6));
        }
        .mana-bar-vintage {
            height: 2px;
            background: rgba(212, 175, 55, 0.2);
            position: relative;
            cursor: pointer;
        }
        .mana-progress-vintage {
            height: 100%;
            background: #d4af37;
            box-shadow: 0 0 8px #d4af37;
        }
        .filigree-corner {
            width: 40px;
            height: 40px;
            position: absolute;
            background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 1C20 1 39 20 39 40' stroke='%23d4af37' stroke-width='2'/%3E%3Cpath d='M0 8C15 8 32 25 32 40' stroke='%23d4af37' stroke-width='1' opacity='0.5'/%3E%3Ccircle cx='4' cy='4' r='2' fill='%23d4af37'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            z-index: 20;
        }
        .corner-tl { top: -4px; left: -4px; transform: rotate(0deg); }
        .corner-tr { top: -4px; right: -4px; transform: rotate(90deg); }
        .corner-bl { bottom: -4px; left: -4px; transform: rotate(-90deg); }
        .corner-br { bottom: -4px; right: -4px; transform: rotate(180deg); }
      `}} />
      
      <div className="retro3-theme h-full w-full">
        <div className="absolute inset-0 leather-texture z-0 pointer-events-none"></div>

        <header className="relative z-10 flex justify-between items-center px-4 pt-4 shrink-0">
          <div className="flex items-center gap-3">
             {truyenData && (
                <button onClick={onBack} className="text-[#d4af37] active:scale-95 duration-100 p-2 hover:bg-[#d4af37]/10 transition-colors uppercase tracking-widest text-xs font-bold">
                  ◄ Retour
                </button>
             )}
          </div>
          <button onClick={() => setThemeOpen(true)} className="text-[#d4af37] active:scale-95 duration-100 p-2 hover:bg-[#d4af37]/10 transition-colors">
             <Settings2 size={24} />
          </button>
        </header>

        <div className="relative z-10 flex flex-col items-center pb-4 px-6 text-center shrink-0">
          <div className="text-[10px] font-['Space_Grotesk'] tracking-[0.4em] text-[#d4af37]/60 uppercase mb-2">Arcane Records</div>
          {!truyenData && (
             <h2 className="font-['Philosopher'] text-3xl font-bold text-[#d4af37] tracking-wider uppercase drop-shadow-md">Tàng Kinh Các</h2>
          )}
        </div>

        <main className="flex-1 flex flex-col items-center px-6 py-4 max-w-lg mx-auto w-full relative z-10">
          
          {/* INPUT MODE */}
          {!truyenData ? (
             <div className="w-full space-y-8 animate-in fade-in">
                <div className="relative p-2">
                   <div className="absolute -inset-1 border border-[#d4af37]/30 pointer-events-none"></div>
                   <input
                      type="url"
                      className="w-full bg-[#050a1a] text-[#f0ead6] p-4 text-center border border-[#d4af37]/50 font-['Cormorant_Garamond'] text-xl italic outline-none placeholder:text-[#d4af37]/30 shadow-inner"
                      placeholder="Quyển trục liên kết..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                   />
                </div>
                {error && <div className="text-red-400 text-sm text-center font-['Cormorant_Garamond'] border border-red-900/50 p-2 bg-red-900/20">{error}</div>}
                
                <button
                  onClick={() => fetchTruyen(url)}
                  disabled={loading || !url}
                  className="w-full py-4 text-[#050a1a] font-['Philosopher'] font-bold text-lg tracking-widest bg-gradient-to-r from-[#d4af37] to-[#8a7431] hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all flex justify-center items-center gap-3 relative"
                >
                   {loading ? <><Loader2 className="animate-spin" size={20} /> Khai Khởi...</> : "MỞ QUYỂN TRỤC"}
                </button>

                {history && (
                   <div className="mt-8 pt-6 border-t border-[#d4af37]/20 w-full relative z-20 animate-in fade-in">
                      <div className="text-[10px] text-[#d4af37]/60 font-['Cormorant_Garamond'] uppercase tracking-[0.2em] mb-3 text-center italic">Hoặc Khôi Phục Ký Ức</div>
                      <button 
                         onClick={() => { setUrl(history.url); fetchTruyen(history.url); }}
                         className="w-full text-left bg-[#d4af37]/5 border border-[#d4af37]/20 hover:border-[#d4af37]/50 p-3 transition-colors rounded-sm group relative overflow-hidden"
                      >
                         <div className="text-[#d4af37] font-['Philosopher'] font-bold text-sm tracking-wider line-clamp-1 mb-1 group-hover:text-[#f0ead6] transition-colors">{history.title}</div>
                         <div className="text-[#8a7431] text-[10px] break-all line-clamp-1 font-['Space_Grotesk']">{history.url}</div>
                      </button>
                   </div>
                )}
             </div>
          ) : (
             /* AUDIO PLAYER MODE */
             <div className="w-full flex-1 flex flex-col justify-center animate-in fade-in">
                
                <div className="flex items-start justify-center gap-2 mb-2 w-full px-4">
                  <h2 className="font-['Philosopher'] text-2xl font-bold text-[#d4af37] tracking-wider uppercase drop-shadow-md text-center leading-snug pb-1 flex-1">{truyenData.title}</h2>
                  <button onClick={handleRefresh} className="p-1 text-[#8a7431] hover:text-[#d4af37] transition-colors shrink-0 mt-1" title="Load lại audio">
                    <RefreshCw size={18} />
                  </button>
                </div>
                <div className="font-['Cormorant_Garamond'] italic text-[#8a7431] text-sm text-center mb-4">
                   {isBuffering ? "Đang luyện hoá âm thanh..." : "Vận tiêu hoàn tất"}
                </div>

                <div className="relative w-full aspect-[4/5] mb-4 group shrink-0 max-h-[25vh]">
                   <div className="filigree-corner corner-tl"></div>
                   <div className="filigree-corner corner-tr"></div>
                   <div className="filigree-corner corner-bl"></div>
                   <div className="filigree-corner corner-br"></div>
                   <div className="gold-filigree w-full h-full p-1 bg-[#050a1a] overflow-hidden shadow-2xl flex items-center justify-center">
                      <div className="text-6xl font-['Philosopher'] text-[#d4af37]/90 drop-shadow-[0_0_15px_#d4af37] select-none">
                         {formatTime(currentTime)}
                      </div>
                   </div>
                </div>

                <div className="w-full mb-4">
                   <div className="mana-bar-vintage w-full" onClick={(e) => {
                       const rect = e.currentTarget.getBoundingClientRect();
                       const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                       handleSeek(percent * duration);
                   }}>
                      <div className="mana-progress-vintage transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
                   </div>
                   <div className="flex justify-between mt-2 font-['Cormorant_Garamond'] text-sm text-[#8a7431] italic tracking-widest">
                      <span>{formatTime(currentTime)}</span>
                      <span>-{formatTime(remaining)}</span>
                   </div>
                </div>

                <div className="flex flex-col items-center gap-6 w-full mb-4 shrink-0">
                   <div className="flex items-center gap-8">
                      <button onClick={toggleSpeed} className="flex flex-col items-center text-[#8a7431] hover:text-[#d4af37] active:scale-95 transition-colors">
                         <Gauge size={22} />
                         <span className="text-[10px] font-['Space_Grotesk'] font-bold">{speed}x</span>
                      </button>

                      <button onClick={() => handleSeek(Math.max(0, currentTime - 10))} className="text-[#8a7431] hover:text-[#d4af37] active:scale-90 transition-colors">
                         <RotateCcw size={28} />
                      </button>

                      <button 
                         onClick={togglePlay}
                         disabled={isBuffering}
                         className="rune-button w-20 h-20 flex items-center justify-center active:scale-95 transition-all text-[#050a1a]"
                      >
                         {isBuffering ? <Loader2 size={32} className="animate-spin" /> : isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-2" />}
                      </button>

                      <button onClick={() => handleSeek(Math.min(duration, currentTime + 10))} className="text-[#8a7431] hover:text-[#d4af37] active:scale-90 transition-colors">
                         <RotateCw size={28} />
                      </button>
                   </div>

                   <div className="flex justify-between items-start w-full px-2 sm:px-6 mt-4">
                     <button 
                       onClick={() => truyenData.prevUrl && handlePrevChapter(truyenData.prevUrl)}
                       disabled={!truyenData.prevUrl}
                       className="group flex flex-col items-center gap-2 active:translate-y-1 transition-all disabled:opacity-30"
                     >
                       <div className="text-[10px] sm:text-xs font-['Philosopher'] text-[#d4af37] tracking-[0.2em] sm:tracking-[0.3em] uppercase opacity-70 group-hover:opacity-100 transition-opacity">Hồi Quy Phía Trước</div>
                       <SkipBack className="text-[#d4af37] text-2xl group-hover:translate-y-1 transition-transform" />
                     </button>
                     
                     <div className="flex-1" />
                     
                     <button 
                       onClick={() => truyenData.nextUrl && handleNextChapter(truyenData.nextUrl)}
                       disabled={!truyenData.nextUrl}
                       className="group flex flex-col items-center gap-2 active:translate-y-1 transition-all disabled:opacity-30"
                     >
                       <div className="text-[10px] sm:text-xs font-['Philosopher'] text-[#d4af37] tracking-[0.2em] sm:tracking-[0.3em] uppercase opacity-70 group-hover:opacity-100 transition-opacity">Khứ Vãng Kế Tiếp</div>
                       <SkipForward className="text-[#d4af37] text-2xl group-hover:translate-y-1 transition-transform" />
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
