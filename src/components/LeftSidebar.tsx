import React from 'react';
import {
  Volume2,
  VolumeX,
  Calendar,
  Music,
  PlusCircle,
  LogOut,
  HelpCircle,
  Info,
  Image as ImageIcon,
  Palette,
  BellRing,
  Download,
  Upload,
  Cloud,
  Laptop
} from 'lucide-react';
import { SchoolSettings } from '../types/bell';

interface LeftSidebarProps {
  settings: SchoolSettings;
  onUpdateSettings: (newSettings: Partial<SchoolSettings>) => void;
  activeView: 'jadwal' | 'sound' | 'edit';
  setActiveView: (view: 'jadwal' | 'sound' | 'edit') => void;
  onOpenAddSchedule: () => void;
  onOpenSoundManager: () => void;
  onOpenBannerSettings: () => void;
  onOpenBgSettings: () => void;
  onOpenHelp: () => void;
  onOpenAbout: () => void;
  onExportSchedules: () => void;
  onImportSchedules: () => void;
  isPlaying: boolean;
  onTestSpeaker: () => void;
  onRequestExit: () => void;
  onOpenGoogleDrive: () => void;
  onOpenWindowsInstaller: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  settings,
  onUpdateSettings,
  activeView,
  setActiveView,
  onOpenAddSchedule,
  onOpenSoundManager,
  onOpenBannerSettings,
  onOpenBgSettings,
  onOpenHelp,
  onOpenAbout,
  onExportSchedules,
  onImportSchedules,
  isPlaying,
  onTestSpeaker,
  onRequestExit,
  onOpenGoogleDrive,
  onOpenWindowsInstaller
}) => {
  return (
    <aside className="w-52 md:w-56 flex-shrink-0 flex flex-col justify-between p-3 select-none text-slate-900">
      <div className="space-y-3">
        {/* Big Speaker Box (Matches Photo) */}
        <div
          onClick={onTestSpeaker}
          title="Klik untuk Tes Suara Speaker"
          className="w-full bg-slate-100 hover:bg-slate-50 border-2 border-slate-400/80 shadow-[inset_0_1px_3px_rgba(0,0,0,0.2),0_1px_2px_rgba(0,0,0,0.1)] rounded p-3 flex flex-col items-center justify-center cursor-pointer group transition-all"
        >
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
              isPlaying
                ? 'bg-blue-600 text-white scale-105 ring-4 ring-blue-300 animate-pulse'
                : 'bg-blue-500 text-white group-hover:scale-105 shadow-md'
            }`}
          >
            {isPlaying ? (
              <BellRing className="w-9 h-9 animate-bounce" />
            ) : (
              <Volume2 className="w-9 h-9" />
            )}
          </div>
          <span className="text-[11px] font-bold text-slate-700 mt-1.5 uppercase tracking-wide">
            {isPlaying ? 'Sedang Berbunyi' : 'Tes Suara Speaker'}
          </span>
          <span className="text-[9px] text-slate-500">Klik untuk membunyikan</span>
        </div>

        {/* Bel Otomatis ON / OFF Radio Box */}
        <div className="bg-slate-900/80 backdrop-blur-xs border border-white/20 rounded p-2.5 text-white shadow-sm space-y-1.5">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold hover:text-green-300 transition-colors">
            <input
              type="radio"
              name="bel_status"
              checked={settings.autoBellEnabled}
              onChange={() => onUpdateSettings({ autoBellEnabled: true })}
              className="w-3.5 h-3.5 text-blue-600 accent-blue-500 cursor-pointer"
            />
            <span className="flex items-center gap-1.5">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  settings.autoBellEnabled
                    ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                    : 'bg-slate-600'
                }`}
              />
              Bel Otomatis ON
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold hover:text-red-300 transition-colors">
            <input
              type="radio"
              name="bel_status"
              checked={!settings.autoBellEnabled}
              onChange={() => onUpdateSettings({ autoBellEnabled: false })}
              className="w-3.5 h-3.5 text-blue-600 accent-blue-500 cursor-pointer"
            />
            <span className="flex items-center gap-1.5">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  !settings.autoBellEnabled
                    ? 'bg-red-500 shadow-[0_0_8px_#ef4444]'
                    : 'bg-slate-600'
                }`}
              />
              Bel Otomatis OFF
            </span>
          </label>
        </div>

        {/* Checkbox: Beep On/Off */}
        <div className="px-1">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-white drop-shadow-sm hover:text-blue-200">
            <input
              type="checkbox"
              checked={settings.beepEnabled}
              onChange={(e) => onUpdateSettings({ beepEnabled: e.target.checked })}
              className="w-4 h-4 rounded text-blue-600 accent-blue-500 cursor-pointer"
            />
            <span>Beep On/Off</span>
          </label>
        </div>

        {/* Primary Desktop Action Buttons (Match image styling) */}
        <div className="space-y-2 pt-1">
          <button
            onClick={() => setActiveView('jadwal')}
            className={`w-full py-2 px-3 text-xs font-bold rounded border shadow-sm transition-all text-center flex items-center justify-center gap-2 ${
              activeView === 'jadwal'
                ? 'bg-gradient-to-b from-blue-100 to-blue-200 border-blue-400 text-blue-900 ring-2 ring-blue-400'
                : 'bg-gradient-to-b from-slate-100 to-slate-200 hover:from-white hover:to-slate-100 border-slate-300 text-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-blue-700" />
            <span>Jadwal</span>
          </button>

          <button
            onClick={onOpenSoundManager}
            className="w-full py-2 px-3 text-xs font-bold rounded border bg-gradient-to-b from-slate-100 to-slate-200 hover:from-white hover:to-slate-100 border-slate-300 text-slate-800 shadow-sm transition-all text-center flex flex-col items-center justify-center"
          >
            <div className="flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-indigo-700" />
              <span>Sound</span>
            </div>
            <span className="text-[10px] text-slate-600 font-normal">(Mp3/Mp4/Wav)</span>
          </button>

          <button
            onClick={onOpenAddSchedule}
            className="w-full py-2 px-3 text-xs font-bold rounded border bg-gradient-to-b from-slate-100 to-slate-200 hover:from-white hover:to-slate-100 border-slate-300 text-slate-800 shadow-sm transition-all text-center flex items-center justify-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-700" />
            <span>Tambah / Edit Jadwal</span>
          </button>

          <button
            onClick={onOpenGoogleDrive}
            className="w-full py-2 px-3 text-xs font-bold rounded border bg-gradient-to-b from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-blue-300 text-blue-900 shadow-sm transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Cloud className="w-3.5 h-3.5 text-blue-600" />
            <span>Google Drive Cloud</span>
          </button>

          <button
            onClick={onOpenWindowsInstaller}
            className="w-full py-2 px-3 text-xs font-bold rounded border bg-gradient-to-b from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 border-emerald-300 text-emerald-900 shadow-sm transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Laptop className="w-3.5 h-3.5 text-emerald-600" />
            <span>Installer Windows</span>
          </button>

          <button
            onClick={onRequestExit}
            className="w-full py-2 px-3 text-xs font-bold rounded border bg-gradient-to-b from-slate-100 to-slate-200 hover:from-red-50 hover:to-red-100 border-slate-300 text-slate-800 hover:text-red-700 shadow-sm transition-all text-center flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-600" />
            <span>Keluar</span>
          </button>
        </div>
      </div>

      {/* Bottom Utility Icons (Exact elements from photo) */}
      <div className="pt-4 border-t border-white/20 mt-3">
        <div className="flex items-center justify-between px-1 mb-2">
          {/* Help button */}
          <button
            onClick={onOpenHelp}
            title="Bantuan & Petunjuk Penggunaan"
            className="w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow transition-transform hover:scale-110"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Info button */}
          <button
            onClick={onOpenAbout}
            title="Informasi & Tentang Aplikasi"
            className="w-7 h-7 rounded-full bg-amber-500 hover:bg-amber-400 text-white flex items-center justify-center shadow transition-transform hover:scale-110"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Export schedule */}
          <button
            onClick={onExportSchedules}
            title="Export / Cadangkan Jadwal (JSON)"
            className="w-7 h-7 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow transition-transform hover:scale-110"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Import schedule */}
          <button
            onClick={onImportSchedules}
            title="Import / Pulihkan Jadwal (JSON)"
            className="w-7 h-7 rounded-full bg-teal-600 hover:bg-teal-500 text-white flex items-center justify-center shadow transition-transform hover:scale-110"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Banner & Background buttons with colored circles */}
        <div className="flex items-center justify-around text-[10px] font-bold text-white drop-shadow-sm">
          <button
            onClick={onOpenBannerSettings}
            className="flex items-center gap-1 hover:text-yellow-300 transition-colors"
            title="Ganti Banner / Logo & Nama Sekolah"
          >
            <span className="w-3.5 h-3.5 rounded-full bg-red-600 border border-white shadow-xs inline-block" />
            <span>Banner</span>
          </button>

          <button
            onClick={onOpenBgSettings}
            className="flex items-center gap-1 hover:text-yellow-300 transition-colors"
            title="Ganti Background Wallpaper"
          >
            <span className="w-3.5 h-3.5 rounded-full bg-yellow-400 border border-white shadow-xs inline-block" />
            <span>Background</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
