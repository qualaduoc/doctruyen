"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipForward, SkipBack, Share2, ArrowLeft, Gauge } from "lucide-react";

interface AudioPlayerProps {
  title: string;
  chunks: string[];
  nextUrl: string | null;
  onNextChapter: (url: string) => void;
  onBack: () => void;
}

export default function AudioPlayer({ title, chunks, nextUrl, onNextChapter, onBack }: AudioPlayerProps) {
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Khởi tạo media session cho màn hình khóa
  useEffect(() => {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: title,
        artist: "Audio-Truyen PWA",
        album: `Phần ${currentChunkIndex + 1}/${chunks.length}`,
        artwork: [
          { src: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" }
        ]
      });

      navigator.mediaSession.setActionHandler("play", () => playAudio());
      navigator.mediaSession.setActionHandler("pause", () => pauseAudio());
      navigator.mediaSession.setActionHandler("previoustrack", () => handlePrev());
      navigator.mediaSession.setActionHandler("nexttrack", () => handleNext());
    }
  }, [title, currentChunkIndex, chunks.length]);

  // Cập nhật tốc độ ngay khi user bấm đổi, hoặc khi audio mới load
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, [speed]);

  const getAudioUrl = (text: string) => {
    return `/api/tts?text=${encodeURIComponent(text)}`;
  };

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
    if (currentChunkIndex < chunks.length - 1) {
      setCurrentChunkIndex((prev) => prev + 1);
    } else if (nextUrl) {
      // Gọi fetch chương mới
      onNextChapter(nextUrl);
    }
  };

  const handlePrev = () => {
    if (currentChunkIndex > 0) {
      setCurrentChunkIndex((prev) => prev - 1);
    }
  };

  // Đặc biệt: khi chunks thay đổi (chuyển chương mới), reset index về 0 và bóp Cò play
  useEffect(() => {
    setCurrentChunkIndex(0);
    setIsPlaying(true);
  }, [chunks]);


  const progress = chunks.length > 0 ? ((currentChunkIndex) / (chunks.length - 1 || 1)) * 100 : 0;
  const currentSrc = chunks[currentChunkIndex] ? getAudioUrl(chunks[currentChunkIndex]) : "";

  return (
    <div className="flex flex-col space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex justify-between items-start">
        <button onClick={onBack} className="p-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
        <button onClick={toggleSpeed} className="flex items-center gap-1 p-2 text-[#ff6600] hover:text-[#ff6600]/80 transition-colors font-bold bg-[#ff6600]/10 rounded-lg">
          <Gauge size={20} />
          {speed}x
        </button>
      </div>

      <div className="text-center space-y-4">
        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-[#ff6600] to-orange-400 rounded-3xl shadow-lg shadow-[#ff6600]/20 flex items-center justify-center overflow-hidden">
             <div className="text-4xl font-black text-white/50">{currentChunkIndex + 1}</div>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white line-clamp-2">{title}</h2>
          <p className="text-gray-400 text-sm mt-1">Đang đọc đoạn {currentChunkIndex + 1}/{chunks.length}</p>
        </div>
      </div>

      {/* Progress Bar (Tua) */}
      <div className="space-y-2">
        <input 
          type="range"
          min="0"
          max={Math.max(0, chunks.length - 1)}
          value={currentChunkIndex}
          onChange={(e) => {
            setCurrentChunkIndex(parseInt(e.target.value));
            if (!isPlaying) setIsPlaying(true); // Đã tua thì cho hát luôn
          }}
          className="w-full h-2 rounded-full appearance-none outline-none bg-gray-800 cursor-pointer accent-[#ff6600]" 
          // Note: Standard tailwind appearance-none works well. 
        />
        <div className="flex justify-between text-xs text-gray-500 font-medium">
          <span>{currentChunkIndex + 1}</span>
          <span>{chunks.length}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6">
        <button 
          onClick={handlePrev}
          disabled={currentChunkIndex === 0}
          className="p-4 text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
        >
          <SkipBack size={32} />
        </button>
        
        <button 
          onClick={togglePlay}
          className="w-20 h-20 rounded-full bg-[#ff6600] text-white flex items-center justify-center shadow-lg shadow-[#ff6600]/30 hover:scale-105 transition-transform"
        >
          {isPlaying ? <Pause size={36} fill="currentColor" /> : <Play size={36} fill="currentColor" className="ml-2" />}
        </button>

        <button 
          onClick={handleNext}
          className="p-4 text-gray-400 hover:text-white transition-colors"
        >
          <SkipForward size={32} />
        </button>
      </div>

      {nextUrl ? (
        <button 
          onClick={() => onNextChapter(nextUrl)}
          className="w-full py-4 mt-2 bg-[#ff6600]/10 hover:bg-[#ff6600]/20 border border-[#ff6600]/30 text-[#ff6600] rounded-xl font-bold transition-all flex justify-center items-center gap-2"
        >
          Chuyển sang Nhâm nhi chương tiếp <SkipForward size={20} />
        </button>
      ) : (
        <div className="text-center text-xs text-gray-500 bg-gray-800/50 p-3 rounded-xl">
          Chưa tìm thấy link chương tiếp
        </div>
      )}

      {/* Hidden Audio Element */}
      <audio 
        ref={audioRef}
        src={currentSrc}
        autoPlay={isPlaying}
        onLoadedData={(e) => {
          // Khi track mới tải xong, ốp luôn cái speed vào
          e.currentTarget.playbackRate = speed;
          // Trên Safari/iOS autoPlay đôi khi xịt, bắn bồi thêm lệnh play nếu đang chế độ isPlaying
          if (isPlaying) {
             e.currentTarget.play().catch(console.error);
          }
        }}
        onEnded={handleNext}
        className="hidden"
        preload="auto"
      />
    </div>
  );
}
