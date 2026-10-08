import React, { useState } from 'react';
import { Play, Square, Edit, Trash2, Copy, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { DayOfWeek, ScheduleItem } from '../types/bell';

interface ScheduleTableProps {
  currentDay: DayOfWeek;
  selectedDay: DayOfWeek;
  onSelectDay: (day: DayOfWeek) => void;
  schedules: ScheduleItem[];
  selectedItem: ScheduleItem | null;
  onSelectItem: (item: ScheduleItem) => void;
  onPlayManual: (item: ScheduleItem) => void;
  onStopPlay: () => void;
  isPlaying: boolean;
  playingItemTitle: string;
  onEditItem: (item: ScheduleItem) => void;
  onRequestDelete: (item: ScheduleItem) => void;
  onToggleItem: (id: string) => void;
  onCopySelectedToDay: (targetDay: DayOfWeek | 'all_weekdays') => void;
  onCopyAllDayToTarget: (targetDay: DayOfWeek | 'all_weekdays') => void;
  onShowToast: (type: 'success' | 'warning' | 'info' | 'error', message: string, title?: string) => void;
}

const DAYS: DayOfWeek[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

export const ScheduleTable: React.FC<ScheduleTableProps> = ({
  currentDay,
  selectedDay,
  onSelectDay,
  schedules,
  selectedItem,
  onSelectItem,
  onPlayManual,
  onStopPlay,
  isPlaying,
  playingItemTitle,
  onEditItem,
  onRequestDelete,
  onToggleItem,
  onCopySelectedToDay,
  onCopyAllDayToTarget,
  onShowToast
}) => {
  const [copyTargetDay, setCopyTargetDay] = useState<string>('all_weekdays');
  const [showCopyDayDialog, setShowCopyDayDialog] = useState<boolean>(false);

  const handleCopy = () => {
    if (!selectedItem) {
      onShowToast('warning', 'Pilih salah satu baris jadwal di tabel terlebih dahulu untuk disalin.', 'Pilih Jadwal');
      return;
    }
    onCopySelectedToDay(copyTargetDay as DayOfWeek | 'all_weekdays');
  };

  return (
    <div className="flex-1 flex flex-col bg-white/95 backdrop-blur-md rounded shadow-xl border border-slate-300 overflow-hidden select-none">
      {/* JADWAL HARI Tabs Header (Matches Photo) */}
      <div className="bg-slate-200 border-b border-slate-300 px-3 py-1.5 flex items-center gap-2 flex-wrap text-xs">
        <span className="font-extrabold text-slate-800 tracking-wider uppercase text-[11px] mr-1">
          JADWAL HARI :
        </span>
        <div className="flex items-center gap-1">
          {DAYS.map((day) => {
            const isSelected = selectedDay === day;
            const isToday = currentDay === day;
            return (
              <button
                key={day}
                onClick={() => onSelectDay(day)}
                className={`relative px-3 py-1 text-xs font-semibold rounded-t transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-100 text-slate-900 border-t-2 border-l border-r border-slate-400 font-bold shadow-xs'
                    : 'bg-slate-300/80 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{day}</span>
                {isToday && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block ml-1" title="Hari Ini" />
                )}
                {/* Red Underline Indicator on Active Tab (Exact detail from photo!) */}
                {isSelected && (
                  <div className="absolute -bottom-1.5 left-0 right-0 h-0.5 bg-red-600 rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setShowCopyDayDialog(!showCopyDayDialog)}
            className="text-[11px] font-medium text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded flex items-center gap-1 transition-colors"
          >
            <Copy className="w-3 h-3" />
            <span>Salin Seluruh Hari {selectedDay}</span>
          </button>
        </div>
      </div>

      {/* Copy All Day Helper Banner */}
      {showCopyDayDialog && (
        <div className="bg-blue-50 border-b border-blue-200 px-3 py-2 flex items-center justify-between text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <Copy className="w-4 h-4 text-blue-600" />
            <span>
              Salin seluruh daftar jadwal hari <strong>{selectedDay}</strong> ke:
            </span>
            <select
              value={copyTargetDay}
              onChange={(e) => setCopyTargetDay(e.target.value)}
              className="bg-white border border-blue-300 rounded px-2 py-0.5 text-xs font-medium text-slate-800"
            >
              <option value="all_weekdays">Semua Hari Kerja (Senin - Jumat)</option>
              {DAYS.filter((d) => d !== selectedDay).map((d) => (
                <option key={d} value={d}>
                  Hari {d}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                onCopyAllDayToTarget(copyTargetDay as DayOfWeek | 'all_weekdays');
                setShowCopyDayDialog(false);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-0.5 rounded text-xs"
            >
              Terapkan
            </button>
          </div>
          <button
            onClick={() => setShowCopyDayDialog(false)}
            className="text-slate-500 hover:text-slate-700 text-xs px-1"
          >
            Batal
          </button>
        </div>
      )}

      {/* Main Grid Table (Authentic Windows Grid Style from User Image) */}
      <div className="flex-1 overflow-auto max-h-[480px] border-b border-slate-300 bg-white">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-200/90 text-slate-800 font-bold sticky top-0 z-10 border-b border-slate-300 shadow-xs">
              <th className="py-2 px-3 border-r border-slate-300 w-16 text-center">Jam</th>
              <th className="py-2 px-3 border-r border-slate-300 w-52 md:w-60">Jadwal</th>
              <th className="py-2 px-3 border-r border-slate-300">Sound</th>
              <th className="py-2 px-2 border-r border-slate-300 w-24 text-center">(+) Nada Bel</th>
              <th className="py-2 px-2 border-r border-slate-300 w-16 text-center">(n) Kali</th>
              <th className="py-2 px-3 w-28 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {schedules.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="font-semibold text-slate-600">Belum ada jadwal untuk hari {selectedDay}.</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Gunakan tombol "Tambah / Edit Jadwal" di sebelah kiri untuk menambahkan jam bel baru.
                  </p>
                </td>
              </tr>
            ) : (
              schedules.map((item, index) => {
                const isSelected = selectedItem?.id === item.id;
                const isCurrentlyPlaying = isPlaying && playingItemTitle.toLowerCase() === item.title.toLowerCase();

                return (
                  <tr
                    key={item.id}
                    onClick={() => onSelectItem(item)}
                    className={`cursor-pointer transition-colors border-b border-slate-200 ${
                      isSelected
                        ? 'bg-blue-600 text-white font-semibold'
                        : index % 2 === 0
                        ? 'bg-white hover:bg-blue-50 text-slate-800'
                        : 'bg-slate-50 hover:bg-blue-50 text-slate-800'
                    } ${!item.enabled ? 'opacity-50' : ''}`}
                  >
                    {/* Jam (e.g. 06:38) */}
                    <td
                      className={`py-1.5 px-3 border-r border-slate-200 text-center font-mono font-bold tabular-nums text-xs ${
                        isSelected ? 'text-white border-blue-500' : 'text-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1">
                        {isCurrentlyPlaying && (
                          <span className="w-2 h-2 rounded-full bg-red-400 animate-ping inline-block" />
                        )}
                        <span>{item.time}</span>
                      </div>
                    </td>

                    {/* Jadwal Title (e.g. jam pembelajaran selesai) */}
                    <td
                      className={`py-1.5 px-3 border-r border-slate-200 truncate ${
                        isSelected ? 'text-white border-blue-500' : 'text-slate-800 font-medium'
                      }`}
                      title={item.title}
                    >
                      {item.title}
                    </td>

                    {/* Sound File Path (e.g. c:\bellvoice\sound\...) */}
                    <td
                      className={`py-1.5 px-3 border-r border-slate-200 font-mono text-[11px] truncate max-w-[280px] ${
                        isSelected ? 'text-blue-100 border-blue-500' : 'text-slate-600'
                      }`}
                      title={item.soundPath}
                    >
                      {item.soundPath}
                    </td>

                    {/* (+) Nada Bel */}
                    <td
                      className={`py-1.5 px-2 border-r border-slate-200 text-center font-bold tabular-nums ${
                        isSelected ? 'text-white border-blue-500' : 'text-slate-700'
                      }`}
                    >
                      {item.chimeType}
                    </td>

                    {/* (n) Kali */}
                    <td
                      className={`py-1.5 px-2 border-r border-slate-200 text-center font-bold tabular-nums ${
                        isSelected ? 'text-white border-blue-500' : 'text-slate-700'
                      }`}
                    >
                      {item.repeatCount}
                    </td>

                    {/* Action buttons */}
                    <td className="py-1 px-2 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            if (isCurrentlyPlaying) {
                              onStopPlay();
                            } else {
                              onPlayManual(item);
                            }
                          }}
                          title={isCurrentlyPlaying ? 'Hentikan' : 'Putar manual baris ini'}
                          className={`p-1 rounded transition-colors ${
                            isSelected
                              ? 'bg-blue-700 hover:bg-blue-800 text-white'
                              : 'hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          {isCurrentlyPlaying ? (
                            <Square className="w-3.5 h-3.5 text-red-400 fill-red-400" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-current" />
                          )}
                        </button>

                        <button
                          onClick={() => onEditItem(item)}
                          title="Edit Jadwal"
                          className={`p-1 rounded transition-colors ${
                            isSelected
                              ? 'bg-blue-700 hover:bg-blue-800 text-white'
                              : 'hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          <Edit className="w-3 h-3" />
                        </button>

                        <button
                          onClick={() => onRequestDelete(item)}
                          title="Hapus Jadwal"
                          className={`p-1 rounded transition-colors ${
                            isSelected
                              ? 'bg-blue-700 hover:bg-red-500 text-white'
                              : 'hover:bg-red-100 text-red-600'
                          }`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Bottom Control Bar (Exact matching user photo) */}
      <div className="bg-slate-100 border-t border-slate-300 p-2.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        {/* Left: Path Input & Play Manual Button */}
        <div className="flex-1 flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={selectedItem ? selectedItem.soundPath : 'Pilih salah satu jadwal di atas untuk memutar sound'}
            className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-mono text-slate-800 shadow-inner"
            title="Lokasi File Sound yang Dipilih"
          />

          <button
            onClick={() => {
              if (selectedItem) {
                if (isPlaying) {
                  onStopPlay();
                } else {
                  onPlayManual(selectedItem);
                }
              } else if (schedules.length > 0) {
                onPlayManual(schedules[0]);
              }
            }}
            className={`px-4 py-1.5 text-xs font-bold rounded border shadow-sm transition-all flex items-center gap-1.5 cursor-pointer ${
              isPlaying
                ? 'bg-red-600 hover:bg-red-700 text-white border-red-700 animate-pulse'
                : 'bg-gradient-to-b from-slate-100 to-slate-200 hover:from-white hover:to-slate-100 border-slate-400 text-slate-800 active:scale-98'
            }`}
          >
            {isPlaying ? (
              <>
                <Square className="w-3 h-3 fill-white" />
                <span>Stop Bel</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-slate-800" />
                <span>Play (manual)</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Salin Jadwal yg di pilih ke Hari lain (Exact from Photo) */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-700 font-medium whitespace-nowrap">
            Salin Jadwal yg di pilih ke Hari lain :
          </span>
          <select
            value={copyTargetDay}
            onChange={(e) => setCopyTargetDay(e.target.value)}
            className="bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 font-medium"
          >
            <option value="all_weekdays">Semua Hari Kerja (Sen-Jum)</option>
            {DAYS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <button
            onClick={handleCopy}
            className="bg-gradient-to-b from-slate-100 to-slate-200 hover:from-white hover:to-slate-100 border border-slate-400 text-slate-800 font-bold px-3 py-1 rounded text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            Ok
          </button>
        </div>
      </div>
    </div>
  );
};
