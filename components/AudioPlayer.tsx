import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, X, FastForward } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Visualizer from './Visualizer';

interface AudioPlayerProps {
  audioUrl: string | null;
  onClose: () => void;
  autoPlay?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, onClose, autoPlay }) => {
  const { getAccentColorClass } = useTheme();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  
  // Web Audio API for Visualizer
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  const accentText = getAccentColorClass('text');
  const accentBg = getAccentColorClass('bg');

  useEffect(() => {
    if (audioUrl) {
      if (!audioRef.current) {
         audioRef.current = new Audio(audioUrl);
      } else {
         audioRef.current.src = audioUrl;
      }

      const audio = audioRef.current;
      audio.playbackRate = playbackRate;

      // Setup Visualizer Context (Lazy init on first play intent)
      const initAudioContext = () => {
        if (!audioContextRef.current) {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            audioContextRef.current = new AudioContext();
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 64; // Low for thick bars
            
            sourceRef.current = audioContextRef.current.createMediaElementSource(audio);
            sourceRef.current.connect(analyserRef.current);
            analyserRef.current.connect(audioContextRef.current.destination);
            
            setAnalyser(analyserRef.current);
        }
        if (audioContextRef.current?.state === 'suspended') {
            audioContextRef.current.resume();
        }
      };

      audio.onplay = () => setIsPlaying(true);
      audio.onpause = () => setIsPlaying(false);
      audio.onended = () => setIsPlaying(false);

      if (autoPlay) {
        initAudioContext();
        audio.play().catch(e => console.error("Auto-play blocked:", e));
      }

      return () => {
        audio.pause();
        audio.src = '';
      };
    }
  }, [audioUrl]);

  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    // Ensure context is running
    if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 64;
        
        sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
        setAnalyser(analyserRef.current);
    }
    if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const stop = () => {
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
    }
  };

  if (!audioUrl) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-lg bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl p-4 animate-in slide-in-from-bottom-10 fade-in duration-300">
      
      {/* Top Row: Visualizer & Close */}
      <div className="flex justify-between items-start mb-4 h-12 gap-4">
        <div className="flex-1 h-full bg-gray-50 dark:bg-gray-800/50 rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700/50">
            <Visualizer analyser={analyser} isPlaying={isPlaying} />
        </div>
        <button 
            onClick={() => { stop(); onClose(); }}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
            <X className="w-5 h-5" />
        </button>
      </div>

      {/* Controls Row */}
      <div className="flex items-center justify-between">
         
         <div className="flex items-center gap-3">
             <button 
                onClick={togglePlay}
                className={`p-3 rounded-full text-white shadow-lg transition-transform hover:scale-105 active:scale-95 ${accentBg}`}
             >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current pl-0.5" />}
             </button>
             
             <button 
                onClick={stop}
                className="p-2.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
             >
                <Square className="w-4 h-4 fill-current" />
             </button>
         </div>

         {/* Speed Control */}
         <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1.5">
            <FastForward className="w-3.5 h-3.5 text-gray-400" />
            <select 
                value={playbackRate}
                onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                className="bg-transparent text-xs font-medium text-gray-700 dark:text-gray-300 focus:outline-none cursor-pointer"
            >
                <option value="0.5">0.5x</option>
                <option value="0.75">0.75x</option>
                <option value="1.0">1.0x</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
                <option value="2.0">2.0x</option>
            </select>
         </div>
      </div>
    </div>
  );
};

export default AudioPlayer;