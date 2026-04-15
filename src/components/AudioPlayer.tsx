"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipForward, ArrowLeft, Gauge, Activity, Loader2 } from "lucide-react";

interface AudioPlayerProps {
  title: string;
  targetUrl: string;
  nextUrl: string | null;
  onNextChapter: (url: string) => void;
  onBack: () => void;
}

const formatTime = (time: number) => {
  if (isNaN(time)) return "00:00";
  const m = Math.floor(time / 60);
  const s = Math.floor(time % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

export default function AudioPlayer({ title, targetUrl, nextUrl, onNextChapter, onBack }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true); // Trạng thái tải file lớn ban đầu
  const [speed, setSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Link ghép file khổng lồ từ server
  const audioSrc = `/api/tts-chapter?url=${encodeURIComponent(targetUrl)}`;

  useEffect(() => {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: title,
        artist: "Auto Scraper TTS",
        album: `Audio-Truyen PWA`,
        artwork: [
          { src: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" }
        ]
      });

      navigator.mediaSession.setActionHandler("play", () => playAudio());
      navigator.mediaSession.setActionHandler("pause", () => pauseAudio());
      navigator.mediaSession.setActionHandler("nexttrack", () => handleNext());
    }
  }, [title]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, [speed]);

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  };

  const toggleSpeed = () => {
    setSpeed((s) => (s === 1 ? 1.25 : s === 1.25 ? 1.5 : s === 1.5 ? 2 : s === 2 ? 0.75 : 1));
  };

  const handleNext = () => {
    if (nextUrl) {
      onNextChapter(nextUrl);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  return (
    <div className="flex flex-col h-full justify-between animate-in fade-in zoom-in-95 duration-500 pt-2 pb-6">
      
      {/* Top Bar - Glassmorphism */}
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

      {/* Album Artwork - Glass panel */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-10 relative z-10 w-full mb-8">
        <div className="w-[200px] h-[200px] bg-white/5 backdrop-blur-2xl border border-white/20 rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(255,102,0,0.3)] flex flex-col items-center justify-center p-6 relative overflow-hidden group">
             {/* Vibrant gradient underlying */}
             <div className={`absolute inset-0 bg-gradient-to-br from-indigo-500/30 via-transparent to-[#ff6600]/30 transition-opacity duration-700 ${isPlaying ? "opacity-100" : "opacity-30"}`} />
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.2),transparent_50%)]" />
             
             {isBuffering ? (
               <Loader2 size={60} className="text-white/50 animate-spin relative z-10" />
             ) : (
               <div className="text-6xl font-black text-white/90 drop-shadow-lg relative z-10 font-sans tracking-tighter">
                  {formatTime(currentTime)}
               </div>
             )}
             
             <div className="absolute bottom-4 text-[10px] uppercase tracking-[0.2em] text-white/50 font-bold mix-blend-overlay">Mạch Nền Chống Tắt Màn Hình</div>
        </div>

        <div className="text-center w-full px-2">
          <h2 className="text-2xl font-bold text-white line-clamp-3 leading-snug drop-shadow-md">{title}</h2>
          <p className="text-white/40 text-sm mt-3 font-medium uppercase tracking-widest">{formatTime(duration)} Tổng thời lượng</p>
        </div>
      </div>

      {/* Controls & Progress - Glassmorphism */}
      <div className="w-full relative z-20 space-y-8">
        
        {/* Progress Scrub Bar theo Thời gian */}
        <div className="space-y-3 px-2">
           <input 
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSliderChange}
            className="w-full h-1.5 rounded-full appearance-none outline-none bg-white/10 cursor-pointer accent-[#ff6600] shadow-[0_0_15px_rgba(255,102,0,0.4)]" 
          />
          <div className="flex justify-between text-[11px] text-white/40 font-bold tracking-wider">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Playback Buttons */}
        <div className="flex items-center justify-center gap-6">
          <div className="w-14 h-14" /> {/* Cân đối layout */}
          
          <button 
            onClick={togglePlay}
            disabled={isBuffering}
            className="w-20 h-20 bg-gradient-to-br from-[#ff6600] to-rose-600 shadow-[0_10px_30px_-10px_rgba(255,102,0,0.8)] border border-white/30 text-white rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed relative overflow-hidden"
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
            onClick={handleNext}
            className="w-14 h-14 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 text-white rounded-full flex items-center justify-center transition-all shadow-lg"
          >
            <SkipForward fill="currentColor" size={20} className="opacity-80" />
          </button>
        </div>

        {/* Chuyển chương Button */}
        {nextUrl ? (
          <button 
            onClick={() => onNextChapter(nextUrl)}
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

      {/* Hidden Audio Streamer */}
      <audio 
        ref={audioRef}
        src={audioSrc}
        autoPlay={true}
        onLoadStart={() => setIsBuffering(true)}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => { setIsBuffering(false); setIsPlaying(true); }}
        onCanPlay={(e) => { 
           setIsBuffering(false);
           e.currentTarget.playbackRate = speed;
        }}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={handleNext}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="hidden"
        preload="auto"
      />

    </div>
  );
}
