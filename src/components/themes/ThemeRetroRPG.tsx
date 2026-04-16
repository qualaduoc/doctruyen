import { Settings2, Loader2, Link as LinkIcon, Fingerprint, Play, Pause, SkipForward, RotateCcw, RotateCw, Gauge } from "lucide-react";
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

export default function ThemeRetroRPG({
  url, setUrl, loading, error, truyenData, fetchTruyen, handleNextChapter, onBack, audioState, setThemeOpen
}: ThemeProps) {

  const { isPlaying, isBuffering, currentTime, duration, speed, togglePlay, toggleSpeed, handleSeek } = audioState;
  
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const remaining = duration - currentTime;

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap');
        .retrorpg-theme {
            background-color: #0c001a !important;
            color: #39ff14;
            font-family: 'VT323', monospace;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            image-rendering: pixelated;
        }
        .pixel-border {
            border: 4px solid #702283;
            box-shadow: 
                inset -4px -4px 0px 0px #2d004d,
                inset 4px 4px 0px 0px #a136bd,
                4px 0px 0px 0px #0c001a,
                -4px 0px 0px 0px #0c001a,
                0px 4px 0px 0px #0c001a,
                0px -4px 0px 0px #0c001a;
        }
        .pixel-btn {
            background: #702283;
            border: 4px solid #0c001a;
            box-shadow: 
                inset -4px -4px 0px 0px #2d004d,
                inset 4px 4px 0px 0px #a136bd;
            image-rendering: pixelated;
        }
        .pixel-btn:active {
            box-shadow: 
                inset 4px 4px 0px 0px #2d004d,
                inset -4px -4px 0px 0px #a136bd;
            transform: translateY(2px);
        }
        .scanlines {
            position: absolute;
            inset: 0;
            background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03));
            background-size: 100% 4px, 3px 100%;
            pointer-events: none;
            z-index: 100;
        }
        .heart-container { display: flex; gap: 4px; }
        .pixel-heart {
            width: 24px; height: 24px; background-color: #ff0040;
            clip-path: polygon(0 25%, 0 50%, 12.5% 50%, 12.5% 62.5%, 25% 62.5%, 25% 75%, 37.5% 75%, 37.5% 87.5%, 50% 87.5%, 50% 100%, 62.5% 100%, 62.5% 87.5%, 75% 87.5%, 75% 75%, 87.5% 75%, 87.5% 62.5%, 100% 62.5%, 100% 50%, 100% 25%, 87.5% 25%, 87.5% 12.5%, 75% 12.5%, 75% 0, 62.5% 0, 62.5% 12.5%, 50% 12.5%, 50% 25%, 37.5% 25%, 37.5% 12.5%, 25% 12.5%, 25% 0, 12.5% 0, 12.5% 12.5%, 0 12.5%);
        }
        .pixel-heart.empty { background-color: #3d3d52; }
        .block-header {
            background: repeating-linear-gradient(45deg, #2d004d, #2d004d 10px, #702283 10px, #702283 20px);
        }
      `}} />
      
      <div className="retrorpg-theme h-full w-full relative">
        <div className="scanlines"></div>

        <header className="block-header border-b-4 border-[#39ff14] h-16 flex items-center justify-between px-4 z-50 shrink-0">
          <div className="flex items-center gap-3">
             {truyenData && (
                <button onClick={onBack} className="pixel-btn p-2 text-white text-xs font-['Press_Start_2P'] uppercase">◄ RET</button>
             )}
             {!truyenData && <span className="font-['Press_Start_2P'] text-[10px] text-[#39ff14]">DUNGEON IDLE</span>}
          </div>
          <button onClick={() => setThemeOpen(true)} className="pixel-btn p-2 text-white relative z-50">
             <Settings2 size={24} />
          </button>
        </header>

        <main className="flex-1 flex flex-col items-center px-4 py-6 w-full max-w-md mx-auto relative z-10">
          
          {/* INPUT MODE */}
          {!truyenData ? (
             <div className="w-full space-y-6 animate-in fade-in">
                <div className="w-full pixel-border bg-[#2d004d] p-4 text-center">
                   <h2 className="text-2xl font-['Press_Start_2P'] text-white uppercase leading-snug mb-2 mt-2">INSERT TOKEN</h2>
                   <div className="text-[#39ff14] font-['VT323'] text-lg">Paste your URL Target</div>
                </div>

                <div className="relative">
                   <input
                      type="url"
                      className="w-full bg-black text-[#39ff14] p-4 pixel-border outline-none font-['VT323'] text-xl placeholder:text-[#3d3d52]"
                      placeholder="https://..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                   />
                </div>
                {error && <div className="text-red-400 font-['Press_Start_2P'] text-[10px] text-center bg-[#2d004d] p-3 pixel-border">{error}</div>}
                
                <button
                  onClick={() => fetchTruyen(url)}
                  disabled={loading || !url}
                  className="w-full font-['Press_Start_2P'] text-white text-xs pixel-btn p-6 disabled:opacity-50 disabled:grayscale flex justify-center items-center gap-2"
                >
                   {loading ? <><Loader2 className="animate-spin" size={16} /> SYNCING</> : "START QUEST"}
                </button>
             </div>
          ) : (
             /* AUDIO PLAYER MODE */
             <div className="w-full flex-1 flex flex-col justify-center animate-in fade-in">
                
                <div className="w-full mb-6 pixel-border bg-[#2d004d] p-4 relative">
                   <div className="flex items-center gap-2 text-[#39ff14] mb-2 font-['Press_Start_2P'] text-[8px] uppercase">
                      <span>FLOOR ID: 42</span>
                   </div>
                   <h2 className="text-2xl font-['Press_Start_2P'] text-white uppercase leading-tight mb-2 line-clamp-2">{truyenData.title}</h2>
                   <div className="text-[#39ff14] font-['VT323'] text-lg">{isBuffering ? "LOADING AUDIO SYSTEM..." : "SYSTEM OPERATIONAL"}</div>
                </div>

                <div className="relative w-full aspect-[4/3] mb-6 max-h-[30vh]">
                   <div className="absolute -top-2 -left-2 w-8 h-8 bg-[#39ff14] z-20" style={{clipPath: "polygon(0 0, 100% 0, 100% 25%, 25% 25%, 25% 100%, 0 100%)"}}></div>
                   <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#39ff14] z-20" style={{clipPath: "polygon(0 0, 100% 0, 100% 100%, 75% 100%, 75% 25%, 0 25%)"}}></div>
                   <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-[#39ff14] z-20" style={{clipPath: "polygon(0 0, 25% 0, 25% 75%, 100% 75%, 100% 100%, 0 100%)"}}></div>
                   <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#39ff14] z-20" style={{clipPath: "polygon(75% 0, 100% 0, 100% 100%, 0 100%, 0 75%, 75% 75%)"}}></div>
                   
                   <div className="w-full h-full pixel-border bg-black overflow-hidden relative flex items-center justify-center">
                      <div className="font-['Press_Start_2P'] text-5xl text-[#39ff14]">{formatTime(currentTime)}</div>
                      
                      <div className="absolute top-4 left-4 font-['Press_Start_2P'] text-[6px] sm:text-[8px] bg-[#702283] px-2 py-1 border-2 border-white text-white">QUEST_ING</div>
                   </div>
                </div>

                <div className="w-full mb-6">
                   <div className="flex justify-between items-center mb-2 font-['Press_Start_2P'] text-[8px] text-[#39ff14]">
                      <span>AP: {Math.floor(currentTime)} / {Math.floor(duration || 0)}</span>
                      <span className="text-white">STAGE {Math.floor(progressPercent)}%</span>
                   </div>
                   
                   <div className="pixel-border bg-black p-2 flex justify-center items-center h-8 cursor-pointer relative" onClick={(e) => {
                       const rect = e.currentTarget.getBoundingClientRect();
                       const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                       handleSeek(percent * duration);
                   }}>
                      <div className="absolute left-0 top-0 bottom-0 bg-[#ff0040] transition-all" style={{ width: `${progressPercent}%` }}></div>
                   </div>

                   <div className="flex justify-between mt-2 font-['VT323'] text-2xl text-white">
                      <span>{formatTime(currentTime)}</span>
                      <span className="text-[#39ff14]">-{formatTime(remaining)}</span>
                   </div>
                </div>

                <div className="flex items-center justify-between w-full mb-4 gap-2">
                   <button onClick={toggleSpeed} className="pixel-btn w-12 h-12 flex flex-col items-center justify-center text-white">
                      <Gauge size={16} />
                      <span className="font-['Press_Start_2P'] text-[8px] mt-1">{speed}x</span>
                   </button>
                   
                   <button onClick={() => handleSeek(Math.max(0, currentTime - 10))} className="pixel-btn w-12 h-12 flex items-center justify-center text-white">
                      <RotateCcw size={22} />
                   </button>

                   <div className="flex items-center gap-4">
                      <button 
                         onClick={togglePlay}
                         disabled={isBuffering}
                         className="w-20 h-20 pixel-btn flex flex-col items-center justify-center disabled:opacity-50"
                      >
                         {isBuffering ? <Loader2 size={32} className="animate-spin text-white" /> : isPlaying ? <Pause size={32} fill="currentColor" className="text-white" /> : <Play size={32} fill="currentColor" className="text-white ml-2" />}
                      </button>
                   </div>
                   
                   <button onClick={() => handleSeek(Math.min(duration, currentTime + 10))} className="pixel-btn w-12 h-12 flex items-center justify-center text-white">
                      <RotateCw size={22} />
                   </button>

                   {truyenData.nextUrl ? (
                      <button onClick={() => handleNextChapter(truyenData.nextUrl)} className="pixel-btn w-12 h-12 flex items-center justify-center text-white">
                         <SkipForward size={22} />
                      </button>
                   ) : (
                      <div className="w-12 h-12 bg-[#2d004d] border-4 border-[#0c001a] opacity-50 flex items-center justify-center"><SkipForward size={22} className="text-[#702283]" /></div>
                   )}
                </div>

             </div>
          )}
        </main>
      </div>
    </>
  );
}
