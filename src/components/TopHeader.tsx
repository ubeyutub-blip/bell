import React, { useEffect, useState } from 'react';
import { Bell, Minus, Square, X, Volume2, ShieldCheck, Sparkles, Cloud, Laptop } from 'lucide-react';
import { SchoolSettings } from '../types/bell';

interface TopHeaderProps {
  settings: SchoolSettings;
  onOpenBannerSettings: () => void;
  onOpenHelp: () => void;
  isPlaying: boolean;
  onRequestExit: () => void;
  onOpenGoogleDrive: () => void;
  onOpenWindowsInstaller: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  settings,
  onOpenBannerSettings,
  isPlaying,
  onRequestExit,
  onOpenGoogleDrive,
  onOpenWindowsInstaller
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format Indonesian date: e.g. "Kamis, 24 Sep"
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  const dayName = dayNames[currentTime.getDay()];
  const dateNum = currentTime.getDate();
  const monthName = monthNamesShort[currentTime.getMonth()];
  const dateString = `${dayName}, ${dateNum} ${monthName}`;

  // Time format: HH:mm:ss
  const hours = String(currentTime.getHours()).padStart(2, '0');
  const minutes = String(currentTime.getMinutes()).padStart(2, '0');
  const seconds = String(currentTime.getSeconds()).padStart(2, '0');
  const timeString = `${hours}:${minutes}:${seconds}`;

  return (
    <header className="w-full select-none flex-shrink-0">
      {/* Windows App Window Chrome Bar */}
      <div className="bg-slate-200 border-b border-slate-300 px-3 py-1 flex items-center justify-between text-xs text-slate-800">
        <div className="flex items-center gap-2 font-medium">
          <div className="w-3.5 h-3.5 bg-blue-600 text-white rounded-xs flex items-center justify-center">
            <Volume2 className="w-2.5 h-2.5" />
          </div>
          <span>Bel Sekolah (Otomatis)</span>
          {isPlaying && (
            <span className="flex items-center gap-1 text-[11px] text-red-600 font-semibold animate-pulse ml-2">
              <span className="w-2 h-2 rounded-full bg-red-600 inline-block"></span>
              Sedang Membunyikan Bel...
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onOpenWindowsInstaller}
            title="Pasang / Buat Installer Desktop Windows"
            className="px-2 py-0.5 text-[11px] font-bold text-emerald-800 hover:bg-emerald-50 border border-emerald-300 hover:border-emerald-400 rounded flex items-center gap-1 transition-colors mr-1 cursor-pointer shadow-xs bg-white"
          >
            <Laptop className="w-3 h-3 text-emerald-600" />
            <span>Install di Windows</span>
          </button>
          <button
            onClick={onOpenGoogleDrive}
            title="Cadangkan & Sinkronkan Jadwal ke Google Drive"
            className="px-2 py-0.5 text-[11px] font-bold text-blue-700 hover:bg-blue-100 border border-blue-200 hover:border-blue-300 rounded flex items-center gap-1 transition-colors mr-2 cursor-pointer shadow-xs bg-white"
          >
            <Cloud className="w-3 h-3 text-blue-600" />
            <span>Google Drive</span>
          </button>
          <button
            title="Minimize"
            className="w-6 h-5 flex items-center justify-center hover:bg-slate-300 text-slate-700 transition-colors rounded-xs"
            onClick={() => {}}
          >
            <Minus className="w-3 h-3" />
          </button>
          <button
            title="Maximize"
            className="w-6 h-5 flex items-center justify-center hover:bg-slate-300 text-slate-700 transition-colors rounded-xs"
            onClick={() => {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
              } else {
                document.exitFullscreen().catch(() => {});
              }
            }}
          >
            <Square className="w-2.5 h-2.5" />
          </button>
          <button
            title="Tutup / Refresh"
            className="w-6 h-5 flex items-center justify-center hover:bg-red-600 hover:text-white text-slate-700 transition-colors rounded-xs"
            onClick={onRequestExit}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Red Banner Header (Exact visual from user photo) */}
      <div className="bg-gradient-to-r from-red-800 via-red-700 to-red-800 border-b-2 border-red-900 text-white px-4 py-2 flex items-center justify-between shadow-md relative overflow-hidden">
        {/* Left: Logo & School Name */}
        <div className="flex items-center gap-3.5 z-10">
          <button
            onClick={onOpenBannerSettings}
            title="Klik untuk ubah Logo dan Nama Sekolah"
            className="group relative flex items-center justify-center bg-black/40 border border-white/40 hover:border-white text-white font-black text-sm tracking-wider px-2.5 py-1.5 rounded transition-all shadow-inner hover:bg-black/60 cursor-pointer"
          >
            {settings.schoolLogoImage ? (
              <img src={settings.schoolLogoImage} alt="School Logo" className="w-8 h-8 object-contain" />
            ) : (
              <span className="font-extrabold tracking-widest text-xs px-1 text-white group-hover:scale-105 transition-transform">
                {settings.schoolLogoText || 'LOGO'}
              </span>
            )}
            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] bg-slate-900 text-slate-300 px-1 py-0.2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Ubah Logo
            </span>
          </button>

          <div
            onClick={onOpenBannerSettings}
            className="cursor-pointer group flex flex-col justify-center"
            title="Klik untuk mengedit Nama Sekolah"
          >
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] uppercase">
                {settings.schoolName || 'SD/SMP/SMA UNGGULAN'}
              </h1>
              <span className="text-[10px] text-white/70 opacity-0 group-hover:opacity-100 transition-opacity underline ml-1">
                (Edit)
              </span>
            </div>
            {settings.schoolSubtext && (
              <p className="text-[11px] text-red-100 tracking-wider font-medium uppercase opacity-90">
                {settings.schoolSubtext}
              </p>
            )}
          </div>
        </div>

        {/* Center & Right: Version, Status, Indonesian Date, Large Digital Clock */}
        <div className="flex items-center gap-5 z-10">
          {/* Version & License Status */}
          <div className="hidden lg:flex items-center gap-3 text-xs">
            <span className="text-white/90 font-medium tracking-wide">
              {settings.version || 'Versi 1.02'}
            </span>
            <span
              className="font-bold px-2 py-0.5 rounded-sm text-[11px] uppercase tracking-wider shadow-sm flex items-center gap-1"
              style={{ color: '#000000', backgroundColor: '#000000' }}
            >
              <ShieldCheck className="w-3 h-3" />
              {settings.isTrial ? 'Trial' : 'Full Version'}
            </span>
          </div>

          {/* Indonesian Date */}
          <div className="hidden sm:block text-right">
            <div className="text-sm md:text-base font-semibold text-white/95 tracking-wide drop-shadow-sm">
              {dateString}
            </div>
            <div className="text-[10px] text-red-200">Waktu Indonesia</div>
          </div>

          {/* Massive Digital Clock (Match Image) */}
          <div className="bg-black/35 border border-white/20 px-3 py-1 rounded shadow-inner flex items-baseline">
            <span
              className="text-2xl sm:text-3xl md:text-4xl font-black tracking-wider text-white tabular-nums drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
              style={{ fontFamily: "'Share Tech Mono', 'JetBrains Mono', monospace" }}
            >
              {timeString}
            </span>
          </div>
        </div>

        {/* Subtle decorative background shine */}
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
      </div>
    </header>
  );
};
