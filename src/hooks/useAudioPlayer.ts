import { useState, useRef, useEffect } from "react";

export function useAudioPlayer(title: string | undefined, targetUrl: string, nextUrl: string | undefined | null, voice: string, onNextChapter?: (n: string) => void) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isRestored, setIsRestored] = useState(false);

  // Resume Playback: Phục hồi thời gian nghe dở
  useEffect(() => {
    if (targetUrl) {
      const savedTime = localStorage.getItem(`audio_time_${targetUrl}`);
      if (savedTime && !isNaN(Number(savedTime))) {
        setCurrentTime(Number(savedTime));
        setIsRestored(false); // Đánh dấu cần phục hồi khi audio sẵn sàng
      } else {
        setCurrentTime(0);
        setIsRestored(true);
      }
    }
  }, [targetUrl]);

  useEffect(() => {
    if (title && "mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: title,
        artist: "Đọc truyện chữ",
        album: `Audio-Truyen PWA`,
      });

      navigator.mediaSession.setActionHandler("play", playAudio);
      navigator.mediaSession.setActionHandler("pause", pauseAudio);
      if (onNextChapter && nextUrl) {
         navigator.mediaSession.setActionHandler("nexttrack", () => onNextChapter(nextUrl));
      } else {
         navigator.mediaSession.setActionHandler("nexttrack", null);
      }
    }
  }, [title, nextUrl]);

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

  const handleSeek = (val: number) => {
    setCurrentTime(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  const audioProps = {
    ref: audioRef,
    src: targetUrl ? `/api/tts-chapter?url=${encodeURIComponent(targetUrl)}&voice=${voice}` : undefined,
    autoPlay: !!targetUrl,
    onLoadStart: () => setIsBuffering(true),
    onWaiting: () => setIsBuffering(true),
    onPlaying: () => { setIsBuffering(false); setIsPlaying(true); },
    onCanPlay: (e: any) => { 
      setIsBuffering(false);
      e.currentTarget.playbackRate = speed;
    },
    onTimeUpdate: (e: any) => {
      const t = e.currentTarget.currentTime;
      setCurrentTime(t);
      if (targetUrl && t > 5 && t < duration - 5) {
         // Lưu tiến độ nếu nghe lớn hơn 5s (Throttle đơn giản bằng cách ghi liên tục, LocalStorage rất nhanh)
         localStorage.setItem(`audio_time_${targetUrl}`, t.toString());
      }
    },
    onLoadedMetadata: (e: any) => {
      setDuration(e.currentTarget.duration);
      if (!isRestored && audioRef.current) {
         audioRef.current.currentTime = currentTime;
         setIsRestored(true);
      }
    },
    onPlay: () => setIsPlaying(true),
    onPause: () => setIsPlaying(false),
    onEnded: () => {
      setIsPlaying(false);
      if (targetUrl) localStorage.removeItem(`audio_time_${targetUrl}`);
      if (onNextChapter && nextUrl) {
        if (audioRef.current) {
          audioRef.current.src = `/api/tts-chapter?url=${encodeURIComponent(nextUrl)}&voice=${voice}`;
          audioRef.current.play().catch(e => console.error("Auto-play background blocked:", e));
        }
        onNextChapter(nextUrl);
      }
    },
    className: "hidden",
    preload: "auto"
  };

  return {
    isPlaying,
    isBuffering,
    speed,
    currentTime,
    duration,
    playAudio,
    pauseAudio,
    togglePlay,
    toggleSpeed,
    handleSeek,
    audioProps,
    audioRef
  };
}
