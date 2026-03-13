import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CustomAudioPlayer — Premium Glassmorphism Audio Player
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Safely handles HTMLMediaElement promises to swallow 'AbortError' exceptions
 * which occur when audio unmounts during rapid state changes.
 */
export default function CustomAudioPlayer({ src }) {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    // Safely unmount/pause without throwing uncaught promises
    useEffect(() => {
        return () => {
            if (audioRef.current && isPlaying) {
                audioRef.current.pause();
            }
        };
    }, [isPlaying]);

    const togglePlay = async (e) => {
        if (e) e.stopPropagation();
        if (!audioRef.current) return;

        if (isPlaying) {
            setIsPlaying(false);
            audioRef.current.pause();
        } else {
            setIsPlaying(true);
            try {
                // Await the native play promise to catch and suppress AbortError natively
                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                    await playPromise;
                }
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Audio playback error:', error);
                }
                setIsPlaying(false);
            }
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100 || 0);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime(0);
    };

    const handleSeek = (e) => {
        if (audioRef.current) {
            const newTime = (e.target.value / 100) * audioRef.current.duration;
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
            setProgress(e.target.value);
        }
    };

    const formatTime = (time) => {
        if (isNaN(time) || time < 0) return "0:00";
        const m = Math.floor(time / 60);
        const s = Math.floor(time % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div dir="ltr" className="flex items-center gap-3 w-[220px] max-w-[240px] bg-white/10 border border-white/15 rounded-full p-1.5 backdrop-blur-md shadow-soft hover:bg-white/15 transition-all">
            {/* Play/Pause Button */}
            <button
                onClick={togglePlay}
                type="button"
                className="w-8 h-8 flex items-center justify-center shrink-0 rounded-full bg-gradient-to-br from-royal-400 to-royal-600 hover:from-royal-500 hover:to-royal-700 shadow-glow-sm text-white transition-all transform hover:scale-105 active:scale-95 z-10"
                aria-label={isPlaying ? "إيقاف" : "تشغيل"}
            >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />}
            </button>

            {/* Progress Slider */}
            <div className="flex-1 flex flex-col justify-center translate-y-[1px] relative cursor-pointer group">
                {/* Background Track */}
                <div className="absolute inset-x-0 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    {/* Fill */}
                    <div 
                        className="h-full bg-royal-400 rounded-full transition-all duration-75"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                {/* Invisible native range input overlay for interaction */}
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress || 0}
                    onChange={handleSeek}
                    className="absolute inset-x-0 h-4 opacity-0 cursor-pointer z-20"
                />
            </div>
            
            {/* Timestamp */}
            <div className="w-9 shrink-0 text-center pr-1">
                <span className="text-[10px] font-bold text-gray-300 tabular-nums">
                    {formatTime(currentTime)}
                </span>
            </div>

            {/* Hidden Native Audio */}
            <audio
                ref={audioRef}
                src={src}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
                className="hidden"
            />
        </div>
    );
}
