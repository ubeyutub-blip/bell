import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Square, Volume2, BellRing, AlertTriangle, FastForward } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';
import { ScheduleItem } from '../types/bell';

interface MediaPlayerBoxProps {
  isPlaying: boolean;
  currentSoundName: string;
  onStop: () => void;
  nextSchedule: { item: ScheduleItem; timeDiffSeconds: number } | null;
  onTriggerQuickBell: (type: 'short1' | 'chime2' | 'chime3' | 'electric') => void;
  onRequestEmergencyAlarm: () => void;
  volume: number;
  onChangeVolume: (vol: number) => void;
}

export const MediaPlayerBox: React.FC<MediaPlayerBoxProps> = ({
  isPlaying,
  currentSoundName,
  onStop,
  nextSchedule,
  onTriggerQuickBell,
  onRequestEmergencyAlarm,
  volume,
  onChangeVolume
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // Audio Equalizer Visualizer using AnalyserNode
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = soundEngine.getAnalyser();

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Background grid
      ctx.fillStyle = '#050c18';
      ctx.fillRect(0, 0, width, height);

      // Subtle horizontal scope lines
      ctx.strokeStyle = '#0d2238';
      ctx.lineWidth = 1;
      for (let y = 15; y < height; y += 18) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (analyser && isPlaying) {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        const barWidth = (width / (bufferLength * 0.75)) * 1.8;
        let x = 4;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = ((dataArray[i] / 255) * (height - 18)) || 3;

          // Gradient for equalizer bars (green to yellow to red)
          const gradient = ctx.createLinearGradient(0, height - 10, 0, 10);
          gradient.addColorStop(0, '#10b981');
          gradient.addColorStop(0.65, '#38bdf8');
          gradient.addColorStop(0.9, '#f59e0b');
          gradient.addColorStop(1, '#ef4444');

          ctx.fillStyle = gradient;
          ctx.fillRect(x, height - barHeight - 8, barWidth - 2, barHeight);

          x += barWidth;
          if (x > width - 4) break;
        }
      } else {
        // Idle ambient subtle waveform
        const time = Date.now() * 0.002;
        ctx.beginPath();
        ctx.strokeStyle = '#1e3a8a';
        ctx.lineWidth = 1.5;
        for (let x = 0; x < width; x += 4) {
          const y = height / 2 + Math.sin(x * 0.05 + time) * 3;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.fillStyle = '#64748b';
        ctx.font = '10px "Share Tech Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('STANDBY / AUDIO READY', width / 2, height / 2 + 18);
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isPlaying]);

  // Format countdown string: e.g. "00:14:32"
  const formatCountdown = (diff: number) => {
    if (diff <= 0) return '00:00:00';
    const hrs = Math.floor(diff / 3600);
    const mins = Math.floor((diff % 3600) / 60);
    const secs = diff % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="w-64 md:w-72 flex-shrink-0 flex flex-col gap-3 select-none">
      {/* Authentic Black Media Player Monitor Screen (Matches Photo) */}
      <div className="bg-slate-950 border-2 border-slate-700 rounded shadow-2xl overflow-hidden flex flex-col">
        {/* Media Player Top Control Header */}
        <div className="bg-slate-900 border-b border-slate-800 px-2.5 py-1.5 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-1.5 font-semibold text-[11px] tracking-wide text-slate-200">
            <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`} />
            <span>{isPlaying ? 'MEMUTAR BEL...' : 'MONITOR MEDIA'}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onStop}
              title="Stop Audio"
              disabled={!isPlaying}
              className={`p-1 rounded text-slate-300 hover:text-white transition-colors ${
                !isPlaying ? 'opacity-40 cursor-not-allowed' : 'hover:bg-red-900/60 text-red-300'
              }`}
            >
              <Square className="w-3 h-3 fill-current" />
            </button>
          </div>
        </div>

        {/* Video / Visualizer Canvas Display Screen */}
        <div className="relative w-full h-36 bg-black flex items-center justify-center overflow-hidden">
          <canvas ref={canvasRef} width={280} height={144} className="w-full h-full block" />

          {/* Overlay Title while playing */}
          {isPlaying && (
            <div className="absolute top-2 left-2 right-2 bg-black/75 backdrop-blur-xs border border-red-500/40 rounded px-2 py-1 text-left shadow-lg pointer-events-none">
              <div className="text-[10px] text-red-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <BellRing className="w-3 h-3 animate-bounce" />
                <span>Bel Sedang Berbunyi</span>
              </div>
              <div className="text-xs text-white font-semibold truncate">
                {currentSoundName || 'Bel Otomatis'}
              </div>
            </div>
          )}
        </div>

        {/* Volume & Status Bar below monitor */}
        <div className="bg-slate-900 border-t border-slate-800 px-3 py-2 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Volume2 className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[11px]">Vol:</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
            className="flex-1 accent-blue-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            title={`Volume: ${Math.round(volume * 100)}%`}
          />
          <span className="text-[11px] font-mono text-blue-400 font-bold w-8 text-right">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>

      {/* Next Bell Countdown Card */}
      <div className="bg-slate-900/85 backdrop-blur-md border border-white/20 rounded p-3 text-white shadow-lg space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-300 font-bold uppercase tracking-wider">
          <span>Bel Berikutnya</span>
          <span className="text-emerald-400 text-[10px] font-mono">
            {nextSchedule ? nextSchedule.item.time : '--:--'}
          </span>
        </div>

        {nextSchedule ? (
          <div>
            <div className="text-sm font-bold text-white truncate drop-shadow-sm">
              {nextSchedule.item.title}
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-[11px] text-slate-400">Sisa Waktu:</span>
              <span
                className="text-lg font-mono font-bold text-yellow-300 tracking-wider tabular-nums"
                style={{ fontFamily: "'Share Tech Mono', monospace" }}
              >
                {formatCountdown(nextSchedule.timeDiffSeconds)}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-400 py-1">
            Tidak ada jadwal bel tersisa untuk hari ini.
          </div>
        )}
      </div>

      {/* Quick Test / Manual Bell Trigger Buttons */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-white/20 rounded p-2.5 text-white shadow-lg">
        <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Tombol Bel Manual</span>
          <span className="text-[9px] text-slate-400">Langsung Bunyi</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 text-xs font-semibold">
          <button
            onClick={() => onTriggerQuickBell('short1')}
            className="bg-slate-800 hover:bg-slate-700 active:bg-blue-600 border border-slate-600 py-1.5 px-2 rounded text-[11px] text-left transition-colors"
          >
            🔔 Bel 1x (Pendek)
          </button>

          <button
            onClick={() => onTriggerQuickBell('chime2')}
            className="bg-slate-800 hover:bg-slate-700 active:bg-blue-600 border border-slate-600 py-1.5 px-2 rounded text-[11px] text-left transition-colors"
          >
            🔔 Bel 2x (Sedang)
          </button>

          <button
            onClick={() => onTriggerQuickBell('chime3')}
            className="bg-slate-800 hover:bg-slate-700 active:bg-blue-600 border border-slate-600 py-1.5 px-2 rounded text-[11px] text-left transition-colors"
          >
            🔔 Bel 3x (Panjang)
          </button>

          <button
            onClick={() => onTriggerQuickBell('electric')}
            className="bg-slate-800 hover:bg-slate-700 active:bg-blue-600 border border-slate-600 py-1.5 px-2 rounded text-[11px] text-left transition-colors"
          >
            🛎️ Bel Kring Gong
          </button>
        </div>

        <button
          onClick={onRequestEmergencyAlarm}
          className="w-full mt-2 bg-red-900/80 hover:bg-red-800 active:bg-red-700 border border-red-600 text-red-100 py-1.5 px-2 rounded text-xs font-bold text-center flex items-center justify-center gap-1.5 transition-colors"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
          <span>Sirene Darurat / Alarm</span>
        </button>
      </div>
    </div>
  );
};
