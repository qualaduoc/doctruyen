import { useState, useRef, useEffect } from "react";

export function useAudioPlayer(title: string | undefined, targetUrl: string, nextUrl: string | undefined | null, onNextChapter?: (n: string) => void) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

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
    src: targetUrl ? `/api/tts-chapter?url=${encodeURIComponent(targetUrl)}` : undefined,
    autoPlay: !!targetUrl,
    onLoadStart: () => setIsBuffering(true),
    onWaiting: () => setIsBuffering(true),
    onPlaying: () => { setIsBuffering(false); setIsPlaying(true); },
    onCanPlay: (e: any) => { 
      setIsBuffering(false);
      e.currentTarget.playbackRate = speed;
    },
    onTimeUpdate: (e: any) => setCurrentTime(e.currentTarget.currentTime),
    onLoadedMetadata: (e: any) => setDuration(e.currentTarget.duration),
    onPlay: () => setIsPlaying(true),
    onPause: () => setIsPlaying(false),
    onEnded: () => {
      setIsPlaying(false);
      if (onNextChapter && nextUrl) {
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
